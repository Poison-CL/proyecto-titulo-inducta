-- Acceso de la org plataforma Inducta a datos globales (soporte / administración).
-- org_id: org_3Kmnph0KjXr140vNE2SdpxPMYk9

create or replace function public.es_org_plataforma_inducta()
returns boolean
language sql
stable
as $$
  select clerk_org_id() = 'org_3Kmnph0KjXr140vNE2SdpxPMYk9';
$$;

drop policy if exists "plataforma_inducta_empresa" on empresa;
create policy "plataforma_inducta_empresa" on empresa
  for all
  using (es_org_plataforma_inducta())
  with check (es_org_plataforma_inducta());

drop policy if exists "plataforma_inducta_usuario" on usuario;
create policy "plataforma_inducta_usuario" on usuario
  for all
  using (es_org_plataforma_inducta())
  with check (es_org_plataforma_inducta());

drop policy if exists "plataforma_inducta_pagos" on pagos_transbank;
create policy "plataforma_inducta_pagos" on pagos_transbank
  for select
  using (es_org_plataforma_inducta());

drop policy if exists "plataforma_inducta_contactos_select" on contactos;
create policy "plataforma_inducta_contactos_select" on contactos
  for select
  using (es_org_plataforma_inducta());

drop policy if exists "plataforma_inducta_contactos_update" on contactos;
create policy "plataforma_inducta_contactos_update" on contactos
  for update
  using (es_org_plataforma_inducta())
  with check (es_org_plataforma_inducta());
