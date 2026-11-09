-- Estado de atención para tickets del formulario de contacto / soporte.
alter table contactos
  add column if not exists estado text not null default 'pendiente'
    check (estado in ('pendiente', 'en_curso', 'atendido'));

alter table contactos
  add column if not exists atendido_en timestamptz;

alter table contactos
  add column if not exists nota_interna text
    check (nota_interna is null or char_length(nota_interna) <= 2000);

create index if not exists contactos_estado_idx on contactos (estado, creado_en desc);
