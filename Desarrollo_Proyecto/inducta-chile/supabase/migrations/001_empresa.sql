create table if not exists empresa (
  id_empresa text primary key,
  nombre_comercial text not null
);

alter table empresa enable row level security;
