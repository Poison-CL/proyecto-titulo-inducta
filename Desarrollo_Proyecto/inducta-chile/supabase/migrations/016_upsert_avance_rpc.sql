-- RPC SECURITY DEFINER: publica avances del colaborador aunque falle el upsert directo (RLS/índice).
-- Verifica que id_empresa coincida con el org del JWT Clerk.

alter table public.avance_trabajador
  add column if not exists nombre_usuario text;

alter table public.avance_trabajador
  add column if not exists test_titulo text;

alter table public.avance_trabajador
  add column if not exists puntaje integer;

alter table public.avance_trabajador
  add column if not exists intentos integer not null default 0;

create unique index if not exists avance_trabajador_empresa_test_usuario_uidx
  on public.avance_trabajador (id_empresa, id_test, id_usuario);

create or replace function public.upsert_avance_trabajador(
  p_id_test integer,
  p_id_empresa text,
  p_id_usuario text,
  p_estado text,
  p_fecha_evaluacion timestamptz default now(),
  p_puntaje integer default null,
  p_intentos integer default 1,
  p_nombre_usuario text default null,
  p_test_titulo text default null
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
declare
  v_org text := public.clerk_org_id();
  v_id integer;
begin
  if p_id_empresa is null or p_id_test is null or p_id_usuario is null then
    raise exception 'faltan claves de avance';
  end if;

  if v_org is null or (p_id_empresa is distinct from v_org and not public.es_org_plataforma_inducta()) then
    raise exception 'org no autorizada para publicar avance';
  end if;

  if p_estado is null or p_estado not in ('pendiente', 'en_curso', 'aprobada', 'reprobada') then
    raise exception 'estado de avance inválido';
  end if;

  select id_avance into v_id
  from public.avance_trabajador
  where id_empresa = p_id_empresa
    and id_test = p_id_test
    and id_usuario = p_id_usuario
  limit 1;

  if v_id is not null then
    update public.avance_trabajador
    set
      estado = p_estado,
      fecha_evaluacion = coalesce(p_fecha_evaluacion, now()),
      puntaje = p_puntaje,
      intentos = coalesce(p_intentos, intentos, 1),
      nombre_usuario = coalesce(p_nombre_usuario, nombre_usuario),
      test_titulo = coalesce(p_test_titulo, test_titulo)
    where id_avance = v_id;
    return v_id;
  end if;

  insert into public.avance_trabajador (
    id_test, id_empresa, id_usuario, estado, fecha_evaluacion, puntaje, intentos, nombre_usuario, test_titulo
  ) values (
    p_id_test, p_id_empresa, p_id_usuario, p_estado, coalesce(p_fecha_evaluacion, now()),
    p_puntaje, coalesce(p_intentos, 1), p_nombre_usuario, p_test_titulo
  )
  returning id_avance into v_id;

  return v_id;
end;
$$;

revoke all on function public.upsert_avance_trabajador(
  integer, text, text, text, timestamptz, integer, integer, text, text
) from public;

grant execute on function public.upsert_avance_trabajador(
  integer, text, text, text, timestamptz, integer, integer, text, text
) to anon, authenticated, service_role;
