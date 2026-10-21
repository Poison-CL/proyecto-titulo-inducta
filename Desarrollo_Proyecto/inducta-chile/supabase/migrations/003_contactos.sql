-- Mensajes del formulario de /contacto. El sitio solo puede insertar; se leen desde el dashboard de Supabase.
create table if not exists contactos (
  id bigint generated always as identity primary key,
  creado_en timestamptz not null default now(),
  motivo text not null check (motivo in ('demo', 'planes', 'soporte', 'otro')),
  nombre text not null check (char_length(nombre) between 1 and 120),
  empresa text check (char_length(empresa) <= 160),
  email text not null check (char_length(email) <= 254 and email ~ '^[^\s@]+@[^\s@]+\.[^\s@]+$'),
  mensaje text not null check (char_length(mensaje) between 10 and 5000)
);

alter table contactos enable row level security;

drop policy if exists "contactos_insert_publico" on contactos;
create policy "contactos_insert_publico" on contactos
  for insert to anon, authenticated
  with check (true);
