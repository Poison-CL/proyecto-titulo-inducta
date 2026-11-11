-- El JWT Clerk a veces llega sin org_role → es_admin_empresa() = false → RLS bloquea inserts.
-- 1) Ampliar es_admin_empresa con dueño de empresa (clerk_user_id).
-- 2) RPC security definer para crear test (autoriza por dueño o admin JWT).

create or replace function public.es_admin_empresa()
returns boolean
language sql
stable
set search_path = ''
as $$
  select
    public.es_org_plataforma_inducta()
    or public.clerk_org_role() in (
      'org:admin',
      'org:administrador_empresa',
      'org:administrador_inducta',
      'admin',
      'administrador_inducta',
      'administrador_empresa'
    )
    or coalesce(public.clerk_org_role(), '') ~* 'admin'
    or (
      public.clerk_org_id() is not null
      and exists (
        select 1
        from public.empresa e
        where e.id_empresa::text = public.clerk_org_id()
          and e.clerk_user_id = coalesce(auth.jwt()->>'sub', '')
      )
    );
$$;

create or replace function public.puede_administrar_empresa(p_id_empresa text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select
    public.es_org_plataforma_inducta()
    or (
      p_id_empresa is not null
      and exists (
        select 1
        from public.empresa e
        where e.id_empresa::text = p_id_empresa
          and e.clerk_user_id = coalesce(auth.jwt()->>'sub', '')
      )
    )
    or (
      public.clerk_org_id() is not null
      and public.clerk_org_id() = p_id_empresa
      and public.es_admin_empresa()
    );
$$;

revoke all on function public.puede_administrar_empresa(text) from public, anon;
grant execute on function public.puede_administrar_empresa(text) to authenticated;

create or replace function public.admin_insertar_test_induccion(
  p_id_empresa text,
  p_titulo text,
  p_porcentaje_aprobacion integer,
  p_estado text default 'activo',
  p_modulos jsonb default '[]'::jsonb
)
returns public.test_induccion
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.test_induccion;
begin
  if not public.puede_administrar_empresa(p_id_empresa) then
    raise exception 'No autorizado para crear evaluaciones en esta empresa';
  end if;

  insert into public.test_induccion (
    id_empresa, titulo, porcentaje_aprobacion, estado, modulos
  ) values (
    p_id_empresa,
    p_titulo,
    greatest(1, least(100, coalesce(p_porcentaje_aprobacion, 70))),
    coalesce(nullif(p_estado, ''), 'activo'),
    coalesce(p_modulos, '[]'::jsonb)
  )
  returning * into v_row;

  return v_row;
exception
  when undefined_column then
    insert into public.test_induccion (
      id_empresa, titulo, porcentaje_aprobacion, estado
    ) values (
      p_id_empresa,
      p_titulo,
      greatest(1, least(100, coalesce(p_porcentaje_aprobacion, 70))),
      coalesce(nullif(p_estado, ''), 'activo')
    )
    returning * into v_row;
    return v_row;
end;
$$;

revoke all on function public.admin_insertar_test_induccion(text, text, integer, text, jsonb) from public, anon;
grant execute on function public.admin_insertar_test_induccion(text, text, integer, text, jsonb) to authenticated;

create or replace function public.admin_insertar_pregunta(
  p_id_empresa text,
  p_id_test integer,
  p_enunciado text
)
returns public.pregunta
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_row public.pregunta;
begin
  if not public.puede_administrar_empresa(p_id_empresa) then
    raise exception 'No autorizado';
  end if;
  if not exists (
    select 1 from public.test_induccion t
    where t.id_test = p_id_test and t.id_empresa::text = p_id_empresa
  ) then
    raise exception 'Evaluación no encontrada';
  end if;

  insert into public.pregunta (id_test, id_empresa, enunciado)
  values (p_id_test, p_id_empresa, p_enunciado)
  returning * into v_row;

  return v_row;
end;
$$;

revoke all on function public.admin_insertar_pregunta(text, integer, text) from public, anon;
grant execute on function public.admin_insertar_pregunta(text, integer, text) to authenticated;

-- Opciones: autorizar también por dueño (no solo clerk_org_id del JWT)
create or replace function public.admin_insertar_opciones(p_rows jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_n int;
  v_empresa text;
begin
  select coalesce(
    nullif((p_rows->0->>'id_empresa'), ''),
    public.clerk_org_id()
  ) into v_empresa;

  if v_empresa is null or not public.puede_administrar_empresa(v_empresa) then
    raise exception 'No autorizado para guardar opciones';
  end if;

  insert into public.opcion_respuesta (id_pregunta, id_empresa, texto_opcion, es_correcta)
  select
    (r->>'id_pregunta')::integer,
    v_empresa,
    (r->>'texto_opcion')::varchar,
    coalesce((r->>'es_correcta')::boolean, false)
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as r
  where exists (
    select 1
    from public.pregunta p
    where p.id_pregunta = (r->>'id_pregunta')::integer
      and p.id_empresa::text = v_empresa
  );

  get diagnostics v_n = row_count;
  if v_n < jsonb_array_length(coalesce(p_rows, '[]'::jsonb)) then
    raise exception 'No se pudieron guardar todas las opciones';
  end if;
end;
$$;

-- Políticas: autorizar por dueño aunque el JWT no traiga org_id/org_role
drop policy if exists test_admin_write on public.test_induccion;
create policy test_admin_write on public.test_induccion
  for all to authenticated
  using (public.puede_administrar_empresa(id_empresa::text))
  with check (public.puede_administrar_empresa(id_empresa::text));

drop policy if exists pregunta_admin_write on public.pregunta;
create policy pregunta_admin_write on public.pregunta
  for all to authenticated
  using (public.puede_administrar_empresa(id_empresa::text))
  with check (public.puede_administrar_empresa(id_empresa::text));

drop policy if exists opcion_admin_all on public.opcion_respuesta;
create policy opcion_admin_all on public.opcion_respuesta
  for all to authenticated
  using (public.puede_administrar_empresa(id_empresa::text))
  with check (public.puede_administrar_empresa(id_empresa::text));
