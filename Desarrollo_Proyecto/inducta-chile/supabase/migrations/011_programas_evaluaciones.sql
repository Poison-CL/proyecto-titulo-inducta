-- Migración 011: Estructura y RLS para Programas, Evaluaciones y Avances de Trabajadores
-- Respalda HU-08 (Crear programa), HU-11 (Cuestionario), HU-12 (Rendir cuestionario),
-- HU-13 (Estado etapas), HU-14 (Saber quién completó y cuándo), HU-15 (Tablero según plan),
-- HU-16 (Tope de evaluaciones del plan), HU-17 (Evidencia al aprobar) y HU-18 (Mostrar evidencia).

create table if not exists test_induccion (
  id_test integer generated always as identity primary key,
  id_empresa text not null references empresa(id_empresa) on delete cascade,
  titulo text not null,
  porcentaje_aprobacion integer not null default 70 check (porcentaje_aprobacion between 1 and 100),
  estado text not null default 'activo' check (estado in ('activo', 'inactivo', 'borrador'))
);

create table if not exists pregunta (
  id_pregunta integer generated always as identity primary key,
  id_test integer not null references test_induccion(id_test) on delete cascade,
  id_empresa text not null,
  enunciado text not null check (char_length(enunciado) between 3 and 1000)
);

create table if not exists opcion_respuesta (
  id_opcion integer generated always as identity primary key,
  id_pregunta integer not null references pregunta(id_pregunta) on delete cascade,
  id_empresa text not null,
  texto_opcion text not null check (char_length(texto_opcion) between 1 and 500),
  es_correcta boolean not null default false
);

create table if not exists avance_trabajador (
  id_avance integer generated always as identity primary key,
  id_test integer not null references test_induccion(id_test) on delete cascade,
  id_empresa text not null,
  id_usuario text not null,
  estado text not null default 'pendiente' check (estado in ('pendiente', 'en_curso', 'aprobada', 'reprobada')),
  fecha_evaluacion timestamptz
);

-- Índices de consulta multi-tenant y de usuario
create index if not exists test_induccion_empresa_idx on test_induccion (id_empresa, estado);
create index if not exists pregunta_test_idx on pregunta (id_test);
create index if not exists opcion_pregunta_idx on opcion_respuesta (id_pregunta);
create index if not exists avance_trabajador_empresa_usuario_idx on avance_trabajador (id_empresa, id_usuario);
create index if not exists avance_trabajador_test_idx on avance_trabajador (id_test);

-- Activar RLS
alter table test_induccion enable row level security;
alter table pregunta enable row level security;
alter table opcion_respuesta enable row level security;
alter table avance_trabajador enable row level security;

-- Políticas de aislamiento por tenant (clerk_org_id) y soporte Inducta
drop policy if exists "test_induccion_tenant" on test_induccion;
create policy "test_induccion_tenant" on test_induccion
  for all
  using (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  )
  with check (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  );

drop policy if exists "pregunta_tenant" on pregunta;
create policy "pregunta_tenant" on pregunta
  for all
  using (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  )
  with check (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  );

drop policy if exists "opcion_respuesta_tenant" on opcion_respuesta;
create policy "opcion_respuesta_tenant" on opcion_respuesta
  for all
  using (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  )
  with check (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  );

drop policy if exists "avance_trabajador_tenant" on avance_trabajador;
create policy "avance_trabajador_tenant" on avance_trabajador
  for all
  using (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  )
  with check (
    id_empresa = clerk_org_id()
    or es_org_plataforma_inducta()
  );
