-- F-P0-2 / F-P0-3 / F-P1-1: grants por rol, estados de avance, certificados

-- --- Certificados: columnas que bloqueaban el upsert ---
alter table public.certificado_emitido
  alter column archivo_pdf_url drop not null;

alter table public.certificado_emitido
  alter column folio set default ('IND-' || to_char(now(), 'YYYY') || '-' || substr(gen_random_uuid()::text, 1, 8));

update public.certificado_emitido
set folio = ('IND-' || to_char(now(), 'YYYY') || '-' || substr(gen_random_uuid()::text, 1, 8))
where folio is null or folio = '';

-- --- Avance: normalizar género y CHECK estricto ---
update public.avance_trabajador set estado = 'aprobada' where estado = 'aprobado';
update public.avance_trabajador set estado = 'reprobada' where estado = 'reprobado';

alter table public.avance_trabajador drop constraint if exists avance_trabajador_estado_check;
alter table public.avance_trabajador drop constraint if exists avance_estado_check;
do $$
begin
  alter table public.avance_trabajador
    add constraint avance_trabajador_estado_check
    check (estado in ('pendiente', 'en_curso', 'aprobada', 'reprobada'));
exception
  when duplicate_object then null;
end $$;

-- Trigger: el cliente no puede inventar aprobado/reprobado (tampoco en masculino)
create or replace function public.avance_proteger_calificacion()
returns trigger
language plpgsql
set search_path = ''
as $$
declare
  st text := lower(coalesce(new.estado, ''));
begin
  if current_user = 'service_role' then
    return new;
  end if;

  -- Normalizar intentos de masculino
  if st = 'aprobado' then new.estado := 'aprobada'; st := 'aprobada'; end if;
  if st = 'reprobado' then new.estado := 'reprobada'; st := 'reprobada'; end if;

  if tg_op = 'INSERT' then
    if st in ('aprobada', 'reprobada') then
      raise exception 'La calificación solo puede registrarla el servidor';
    end if;
    new.estado := coalesce(nullif(st, ''), 'en_curso');
    if new.estado not in ('pendiente', 'en_curso') then
      new.estado := 'en_curso';
    end if;
    new.puntaje := null;
    new.intentos := coalesce(new.intentos, 0);
    new.fecha_evaluacion := null;
    if new.id_usuario is distinct from coalesce(auth.jwt()->>'sub', '') then
      raise exception 'Solo puede crear su propio avance';
    end if;
  elsif tg_op = 'UPDATE' then
    -- Solo pendiente <-> en_curso; el resto lo fija el servidor
    if st in ('aprobada', 'reprobada') or st not in ('pendiente', 'en_curso') then
      new.estado := coalesce(old.estado, 'en_curso');
    end if;
    new.puntaje := old.puntaje;
    new.intentos := old.intentos;
    new.fecha_evaluacion := old.fecha_evaluacion;
    new.id_empresa := old.id_empresa;
    new.nombre_usuario := old.nombre_usuario;
    -- Gate de estudio: no se puede marcar módulos completos a mano hacia 100% inventado
    -- (el cliente sí puede avanzar progreso real; no tocamos progreso_modulos aquí)
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

-- Avance: sin DELETE desde el cliente; UPDATE solo progreso
drop policy if exists avance_trabajador_write_own on public.avance_trabajador;
drop policy if exists avance_trabajador_insert_own on public.avance_trabajador;
drop policy if exists avance_trabajador_update_own on public.avance_trabajador;
drop policy if exists avance_trabajador_delete_own on public.avance_trabajador;

create policy avance_trabajador_insert_own on public.avance_trabajador
  for insert to authenticated
  with check (
    id_empresa::text = public.clerk_org_id()
    and id_usuario = coalesce(auth.jwt()->>'sub', '')
  );

create policy avance_trabajador_update_own on public.avance_trabajador
  for update to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and id_usuario = coalesce(auth.jwt()->>'sub', '')
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and id_usuario = coalesce(auth.jwt()->>'sub', '')
  );

revoke delete, truncate, references, trigger on public.avance_trabajador from anon, authenticated;
grant select, insert, update on public.avance_trabajador to authenticated;

-- --- Helpers de rol admin de empresa ---
create or replace function public.es_admin_empresa()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.clerk_org_role() in (
    'org:admin',
    'org:administrador_empresa',
    'admin',
    'org:administrador_inducta'
  )
  or public.es_org_plataforma_inducta();
$$;

-- --- empresa / usuario / certificado: escritura restringida ---
drop policy if exists "aislamiento_empresa" on public.empresa;
drop policy if exists empresa_select on public.empresa;
drop policy if exists empresa_update_admin on public.empresa;

create policy empresa_select on public.empresa
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy empresa_update_admin on public.empresa
  for update to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

-- Sync inicial desde el panel (solo su org). Provisionar post-pago usa service_role.
create policy empresa_insert_propia on public.empresa
  for insert to authenticated
  with check (id_empresa::text = public.clerk_org_id());

revoke delete, truncate on public.empresa from anon, authenticated;
grant select, insert, update on public.empresa to authenticated;

create or replace function public.empresa_proteger_campos()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if current_user = 'service_role' then
    return new;
  end if;
  if tg_op = 'INSERT' then
    -- Cliente: solo alta de identidad; no puede auto-asignarse plan pago
    new.plan := 'demo';
    new.periodo := null;
    new.plan_vence_en := null;
    new.cuenta_estado := coalesce(new.cuenta_estado, 'activa');
    new.id_pago_origen := null;
    new.email_temporal := null;
    new.clerk_user_id := null;
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
  before insert or update on public.empresa
  for each row execute function public.empresa_proteger_campos();

-- usuario
drop policy if exists "aislamiento_usuario" on public.usuario;
drop policy if exists usuario_select on public.usuario;
drop policy if exists usuario_admin_write on public.usuario;

create policy usuario_select on public.usuario
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy usuario_admin_write on public.usuario
  for all to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

revoke truncate on public.usuario from anon, authenticated;

-- certificado: solo SELECT; escritura service_role
drop policy if exists "aislamiento_certificado" on public.certificado_emitido;
drop policy if exists certificado_select on public.certificado_emitido;

create policy certificado_select on public.certificado_emitido
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and (
      id_usuario = coalesce(auth.jwt()->>'sub', '')
      or public.es_admin_empresa()
    )
  );

revoke insert, update, delete, truncate on public.certificado_emitido from anon, authenticated;
grant select on public.certificado_emitido to authenticated;

-- --- Contenido de evaluación: SELECT todos; escritura solo admin ---
drop policy if exists "aislamiento_test" on public.test_induccion;
drop policy if exists test_select on public.test_induccion;
drop policy if exists test_admin_write on public.test_induccion;

create policy test_select on public.test_induccion
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy test_admin_write on public.test_induccion
  for all to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

drop policy if exists "aislamiento_pregunta" on public.pregunta;
drop policy if exists pregunta_select on public.pregunta;
drop policy if exists pregunta_admin_write on public.pregunta;

create policy pregunta_select on public.pregunta
  for select to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy pregunta_admin_write on public.pregunta
  for all to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

drop policy if exists "aislamiento_opcion" on public.opcion_respuesta;
drop policy if exists opcion_select on public.opcion_respuesta;
drop policy if exists opcion_admin_write on public.opcion_respuesta;
drop policy if exists opcion_admin_all on public.opcion_respuesta;

-- Solo admin de la org (RLS). Trabajador rinde vía Edge Function; lee opciones sin clave en el front.
create policy opcion_admin_all on public.opcion_respuesta
  for all to authenticated
  using (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  )
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

create policy opcion_miembro_select_texto on public.opcion_respuesta
  for select to authenticated
  using (id_empresa::text = public.clerk_org_id());

revoke all on public.opcion_respuesta from anon, authenticated;
grant select (id_opcion, id_pregunta, id_empresa, texto_opcion) on public.opcion_respuesta to authenticated;
grant insert, update, delete on public.opcion_respuesta to authenticated;
-- Admin necesita es_correcta al editar (mismo rol authenticated: grant columna; RLS no bloquea admin)
grant select (es_correcta) on public.opcion_respuesta to authenticated;
grant select on public.opcion_respuesta_publica to authenticated;

-- plan_limites
alter table public.plan_limites enable row level security;
drop policy if exists plan_limites_read on public.plan_limites;
create policy plan_limites_read on public.plan_limites
  for select to authenticated
  using (true);
revoke all on public.plan_limites from anon, authenticated;
grant select on public.plan_limites to authenticated;

revoke execute on function public.test_induccion_respetar_cupo() from anon, authenticated, public;

revoke truncate on all tables in schema public from anon, authenticated;
