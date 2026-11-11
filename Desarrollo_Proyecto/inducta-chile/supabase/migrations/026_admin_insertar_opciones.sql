-- Insertar opciones con es_correcta: authenticated no tiene SELECT en esa columna
-- (024), y PostgREST/RETURNING falla al insertar. RPC security definer para admins.
create or replace function public.admin_insertar_opciones(p_rows jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_org text := public.clerk_org_id();
  v_n int;
begin
  if not public.es_admin_empresa() then
    raise exception 'Solo administradores de la empresa';
  end if;
  if v_org is null or v_org = '' then
    raise exception 'Sin organización activa en el token';
  end if;

  insert into public.opcion_respuesta (id_pregunta, id_empresa, texto_opcion, es_correcta)
  select
    (r->>'id_pregunta')::integer,
    v_org,
    (r->>'texto_opcion')::varchar,
    coalesce((r->>'es_correcta')::boolean, false)
  from jsonb_array_elements(coalesce(p_rows, '[]'::jsonb)) as r
  where coalesce(r->>'id_empresa', v_org) = v_org
    and exists (
      select 1
      from public.pregunta p
      where p.id_pregunta = (r->>'id_pregunta')::integer
        and p.id_empresa::text = v_org
    );

  get diagnostics v_n = row_count;
  if v_n < jsonb_array_length(coalesce(p_rows, '[]'::jsonb)) then
    raise exception 'No se pudieron guardar todas las opciones (permiso o pregunta inválida)';
  end if;
end;
$$;

revoke all on function public.admin_insertar_opciones(jsonb) from public, anon;
grant execute on function public.admin_insertar_opciones(jsonb) to authenticated;
