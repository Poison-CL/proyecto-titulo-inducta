-- N-P0-2 / P0-4 (parcial): calificación en servidor, vista sin es_correcta, avances solo SELECT desde cliente

-- Límites de plan en DB
create table if not exists public.plan_limites (
  plan text primary key,
  max_evaluaciones int,
  max_miembros int
);

insert into public.plan_limites (plan, max_evaluaciones, max_miembros) values
  ('demo', 1, 5),
  ('basico', 5, 50),
  ('plus', null, 250),
  ('plusplus', null, null)
on conflict (plan) do update set
  max_evaluaciones = excluded.max_evaluaciones,
  max_miembros = excluded.max_miembros;

create or replace function public.clerk_org_role()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(current_setting('request.jwt.claims', true)::json->>'org_role', ''),
    nullif(current_setting('request.jwt.claims', true)::json->'o'->>'rol', ''),
    nullif(current_setting('request.jwt.claims', true)::json->'o'->>'role', '')
  );
$$;

alter function public.clerk_org_id() set search_path = '';
alter function public.es_org_plataforma_inducta() set search_path = '';

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;

-- Vista pública de opciones (sin es_correcta)
create or replace view public.opcion_respuesta_publica
with (security_invoker = on) as
select id_opcion, id_pregunta, id_empresa, texto_opcion
from public.opcion_respuesta;

grant select on public.opcion_respuesta_publica to authenticated;

-- Revocar escritura de avances desde el cliente
drop policy if exists "aislamiento_avance" on public.avance_trabajador;
drop policy if exists avance_trabajador_insert on public.avance_trabajador;
drop policy if exists avance_trabajador_update on public.avance_trabajador;
drop policy if exists avance_trabajador_delete on public.avance_trabajador;
drop policy if exists avance_trabajador_select on public.avance_trabajador;
drop policy if exists "avance_trabajador_tenant" on public.avance_trabajador;

create policy avance_trabajador_select_own on public.avance_trabajador
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and (
      id_usuario = coalesce(auth.jwt()->>'sub', '')
      or public.clerk_org_role() in ('org:admin', 'org:administrador_empresa', 'admin')
      or public.es_org_plataforma_inducta()
    )
  );

-- Escritura propia solo para progreso de estudio; la calificación la hace service_role / Edge Function
create or replace function public.avance_proteger_calificacion()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    if new.estado in ('aprobada', 'reprobada') then
      raise exception 'La calificación solo puede registrarla el servidor';
    end if;
    new.puntaje := null;
    if new.id_usuario is distinct from coalesce(auth.jwt()->>'sub', '') then
      raise exception 'Solo puede crear su propio avance';
    end if;
  elsif tg_op = 'UPDATE' then
    if new.estado in ('aprobada', 'reprobada') and new.estado is distinct from old.estado then
      raise exception 'La calificación solo puede registrarla el servidor';
    end if;
    -- El cliente no puede tocar puntaje/intentos finales
    new.puntaje := old.puntaje;
    if new.id_usuario is distinct from old.id_usuario or new.id_test is distinct from old.id_test then
      raise exception 'No puede reasignar el avance';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_avance_proteger on public.avance_trabajador;
create trigger trg_avance_proteger
  before insert or update on public.avance_trabajador
  for each row execute function public.avance_proteger_calificacion();

drop policy if exists avance_trabajador_write_own on public.avance_trabajador;
create policy avance_trabajador_write_own on public.avance_trabajador
  for all to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and id_usuario = coalesce(auth.jwt()->>'sub', '')
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and id_usuario = coalesce(auth.jwt()->>'sub', '')
  );

revoke truncate, references, trigger on public.avance_trabajador from anon, authenticated;
grant select, insert, update on public.avance_trabajador to authenticated;

-- Certificados: folio + columnas de respaldo
alter table public.certificado_emitido
  add column if not exists folio text,
  add column if not exists puntaje int,
  add column if not exists porcentaje_minimo int,
  add column if not exists test_titulo text,
  add column if not exists id_test bigint,
  add column if not exists id_avance bigint;

create unique index if not exists certificado_emitido_folio_uidx
  on public.certificado_emitido (folio)
  where folio is not null;

create unique index if not exists certificado_emitido_avance_uidx
  on public.certificado_emitido (id_avance)
  where id_avance is not null;

-- Empresa: bloquear campos sensibles desde el cliente
create or replace function public.empresa_proteger_campos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'service_role' then
    return new;
  end if;
  if new.plan is distinct from old.plan
     or new.plan_vence_en is distinct from old.plan_vence_en
     or new.periodo is distinct from old.periodo
     or new.cuenta_estado is distinct from old.cuenta_estado
     or new.clerk_user_id is distinct from old.clerk_user_id
     or new.id_pago_origen is distinct from old.id_pago_origen
     or new.email_temporal is distinct from old.email_temporal
  then
    raise exception 'No puede modificar campos de plan/cuenta desde el cliente';
  end if;
  return new;
end;
$$;

drop trigger if exists trg_empresa_proteger on public.empresa;
create trigger trg_empresa_proteger
  before update on public.empresa
  for each row execute function public.empresa_proteger_campos();

-- Tope de evaluaciones por plan
create or replace function public.test_induccion_respetar_cupo()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_plan text;
  v_max int;
  v_count int;
begin
  select e.plan into v_plan from public.empresa e where e.id_empresa = new.id_empresa;
  select pl.max_evaluaciones into v_max from public.plan_limites pl where pl.plan = coalesce(v_plan, 'demo');
  if v_max is null then
    return new;
  end if;
  select count(*)::int into v_count from public.test_induccion t where t.id_empresa = new.id_empresa;
  if v_count >= v_max then
    raise exception 'Cupo de evaluaciones del plan agotado (% / %)', v_count, v_max;
  end if;
  return new;
end;
$$;

drop trigger if exists trg_test_cupo on public.test_induccion;
create trigger trg_test_cupo
  before insert on public.test_induccion
  for each row execute function public.test_induccion_respetar_cupo();

-- Uniques pagos
do $$ begin
  alter table public.pagos_transbank add constraint pagos_transbank_orden_compra_key unique (orden_compra);
exception when duplicate_table or duplicate_object then null;
end $$;

do $$ begin
  alter table public.pagos_transbank add constraint pagos_transbank_token_transbank_key unique (token_transbank);
exception when duplicate_table or duplicate_object then null;
end $$;

do $$ begin
  alter table public.empresa add constraint empresa_id_pago_origen_key unique (id_pago_origen);
exception when duplicate_table or duplicate_object then null;
end $$;
