-- Respuesta enviada desde el panel de soporte Inducta.
alter table contactos
  add column if not exists respuesta text
    check (respuesta is null or char_length(respuesta) between 1 and 5000);

alter table contactos
  add column if not exists respondido_en timestamptz;

alter table contactos
  add column if not exists respondido_por text
    check (respondido_por is null or char_length(respondido_por) <= 200);
