-- La BD tenía: pendiente | en_proceso | aprobado | reprobado
-- La app usa:   pendiente | en_curso   | aprobada | reprobada
-- Aceptamos ambos y dejamos la app como fuente canónica.

alter table public.avance_trabajador
  drop constraint if exists avance_trabajador_estado_check;

alter table public.avance_trabajador
  add constraint avance_trabajador_estado_check
  check (
    estado in (
      'pendiente',
      'en_proceso',
      'en_curso',
      'aprobado',
      'aprobada',
      'reprobado',
      'reprobada'
    )
  );

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
  v_estado text := lower(coalesce(p_estado, ''));
begin
  if p_id_empresa is null or p_id_test is null or p_id_usuario is null then
    raise exception 'faltan claves de avance';
  end if;

  if v_org is null or (p_id_empresa is distinct from v_org and not public.es_org_plataforma_inducta()) then
    raise exception 'org no autorizada para publicar avance';
  end if;

  if v_estado in ('aprobado') then v_estado := 'aprobada'; end if;
  if v_estado in ('reprobado') then v_estado := 'reprobada'; end if;
  if v_estado in ('en_proceso') then v_estado := 'en_curso'; end if;

  if v_estado not in ('pendiente', 'en_curso', 'aprobada', 'reprobada') then
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
      estado = v_estado,
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
    p_id_test, p_id_empresa, p_id_usuario, v_estado, coalesce(p_fecha_evaluacion, now()),
    p_puntaje, coalesce(p_intentos, 1), p_nombre_usuario, p_test_titulo
  )
  returning id_avance into v_id;

  return v_id;
end;
$$;
