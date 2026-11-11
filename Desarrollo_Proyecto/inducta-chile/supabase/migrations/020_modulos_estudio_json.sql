-- Niveles de estudio por evaluación (JSON) + progreso del colaborador.
-- Una sola migración; evita tablas N+1 / muchas peticiones en plan gratis.

alter table public.test_induccion
  add column if not exists modulos jsonb not null default '[]'::jsonb;

alter table public.avance_trabajador
  add column if not exists progreso_modulos jsonb not null default '{"completados":[]}'::jsonb;
