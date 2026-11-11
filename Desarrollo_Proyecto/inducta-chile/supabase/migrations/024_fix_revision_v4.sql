-- Revisión v4: UNIQUE certificados, SELECT avances, es_correcta, triggers

-- G-P1-1: UNIQUE real (PostgREST ON CONFLICT no soporta índices parciales)
drop index if exists public.certificado_emitido_avance_uidx;
drop index if exists public.certificado_emitido_folio_uidx;

do $$
begin
  alter table public.certificado_emitido
    add constraint certificado_emitido_id_avance_key unique (id_avance);
exception when duplicate_object then null;
end $$;

do $$
begin
  alter table public.certificado_emitido
    add constraint certificado_emitido_folio_key unique (folio);
exception when duplicate_object then null;
end $$;

-- G-P1-2: admin ve avances de su equipo (incluye org:administrador_inducta vía helper)
drop policy if exists avance_trabajador_select_own on public.avance_trabajador;
create policy avance_trabajador_select_own on public.avance_trabajador
  for select to authenticated
  using (
    id_empresa::text = (select public.clerk_org_id())
    and (
      id_usuario = (select coalesce(auth.jwt()->>'sub', ''))
      or public.es_admin_empresa()
    )
  );

-- F-P0-2: trabajador no lee es_correcta; admin usa RPC
revoke select (es_correcta) on public.opcion_respuesta from authenticated, anon;

create or replace function public.opciones_con_correcta(p_id_test bigint)
returns table (
  id_opcion bigint,
  id_pregunta bigint,
  texto_opcion text,
  es_correcta boolean
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.es_admin_empresa() then
    raise exception 'Solo administradores de la empresa';
  end if;
  if not exists (
    select 1 from public.test_induccion t
    where t.id_test = p_id_test
      and t.id_empresa::text = public.clerk_org_id()
  ) then
    raise exception 'Evaluación no encontrada en su empresa';
  end if;
  return query
  select o.id_opcion, o.id_pregunta, o.texto_opcion, o.es_correcta
  from public.opcion_respuesta o
  join public.pregunta p on p.id_pregunta = o.id_pregunta
  where p.id_test = p_id_test
    and o.id_empresa::text = public.clerk_org_id();
end;
$$;

revoke all on function public.opciones_con_correcta(bigint) from public, anon;
grant execute on function public.opciones_con_correcta(bigint) to authenticated;

-- G-P2-2: no degradar aprobación/reprobación desde el cliente
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
    if old.estado in ('aprobada', 'reprobada') then
      new.estado := old.estado;
    elsif st in ('aprobada', 'reprobada') or st not in ('pendiente', 'en_curso') then
      new.estado := coalesce(old.estado, 'en_curso');
    end if;
    new.puntaje := old.puntaje;
    new.intentos := old.intentos;
    new.fecha_evaluacion := old.fecha_evaluacion;
    new.id_empresa := old.id_empresa;
    new.nombre_usuario := old.nombre_usuario;
    if new.id_usuario is distinct from old.id_usuario or new.id_test is distinct from old.id_test then
      raise exception 'No puede reasignar el avance';
    end if;
  end if;
  return new;
end;
$$;

-- G-P2-3: insert empresa solo admin + cuenta_estado válido
drop policy if exists empresa_insert_propia on public.empresa;
create policy empresa_insert_propia on public.empresa
  for insert to authenticated
  with check (
    id_empresa::text = public.clerk_org_id()
    and public.es_admin_empresa()
  );

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
    new.plan := 'demo';
    new.periodo := null;
    new.plan_vence_en := null;
    new.cuenta_estado := 'verificada';
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

-- CHECK de estados de pago (alineado con tbk-confirmar)
do $$
begin
  alter table public.pagos_transbank drop constraint if exists pagos_transbank_estado_check;
  alter table public.pagos_transbank
    add constraint pagos_transbank_estado_check
    check (estado in ('pendiente', 'pagado', 'anulado', 'rechazado', 'reembolsado'));
exception when others then
  null;
end $$;
