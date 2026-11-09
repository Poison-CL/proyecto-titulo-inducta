-- Hilo de chat de soporte (cliente = mensaje original del formulario; soporte = respuestas).
create table if not exists soporte_mensajes (
  id bigint generated always as identity primary key,
  contacto_id bigint not null references contactos (id) on delete cascade,
  autor text not null check (autor in ('cliente', 'soporte')),
  cuerpo text not null check (char_length(cuerpo) between 1 and 5000),
  email_enviado boolean not null default false,
  email_error text,
  creado_por text,
  creado_en timestamptz not null default now()
);

create index if not exists soporte_mensajes_contacto_idx
  on soporte_mensajes (contacto_id, creado_en);

alter table soporte_mensajes enable row level security;

drop policy if exists "plataforma_inducta_soporte_mensajes" on soporte_mensajes;
create policy "plataforma_inducta_soporte_mensajes" on soporte_mensajes
  for all
  using (es_org_plataforma_inducta())
  with check (es_org_plataforma_inducta());

-- Sembrar el mensaje original del contacto como primer mensaje del chat (una vez).
insert into soporte_mensajes (contacto_id, autor, cuerpo, email_enviado, creado_en)
select c.id, 'cliente', c.mensaje, false, c.creado_en
from contactos c
where not exists (
  select 1 from soporte_mensajes m where m.contacto_id = c.id and m.autor = 'cliente'
);
