-- La tabla test_induccion pudo crearse antes con otro CHECK de estado.
-- Unificamos a: activo | inactivo | borrador (lo que usa la app).

do $$
declare
  r record;
begin
  for r in
    select c.conname
    from pg_constraint c
    join pg_class t on t.oid = c.conrelid
    join pg_namespace n on n.oid = t.relnamespace
    where n.nspname = 'public'
      and t.relname = 'test_induccion'
      and c.contype = 'c'
      and pg_get_constraintdef(c.oid) ilike '%estado%'
  loop
    execute format('alter table public.test_induccion drop constraint %I', r.conname);
  end loop;
end $$;

-- Normalizar valores viejos si existían
update public.test_induccion
set estado = case
  when lower(estado) in ('activo', 'activa', 'active', 'published', 'publicado', 'publicada') then 'activo'
  when lower(estado) in ('inactivo', 'inactiva', 'inactive', 'paused', 'pausada', 'pausado') then 'inactivo'
  when lower(estado) in ('borrador', 'draft') then 'borrador'
  else 'activo'
end;

alter table public.test_induccion
  alter column estado set default 'activo';

alter table public.test_induccion
  add constraint test_induccion_estado_check
  check (estado in ('activo', 'inactivo', 'borrador'));
