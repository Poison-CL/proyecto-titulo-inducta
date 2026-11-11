-- Avances visibles para el admin de la empresa: metadatos + upsert + RLS explícita.

alter table public.avance_trabajador
  add column if not exists nombre_usuario text;

alter table public.avance_trabajador
  add column if not exists test_titulo text;

-- Evita duplicados y habilita upsert desde el cliente
create unique index if not exists avance_trabajador_empresa_test_usuario_uidx
  on public.avance_trabajador (id_empresa, id_test, id_usuario);

-- Políticas separadas (más predecibles que FOR ALL)
drop policy if exists "avance_trabajador_tenant" on public.avance_trabajador;
drop policy if exists "avance_trabajador_select" on public.avance_trabajador;
drop policy if exists "avance_trabajador_insert" on public.avance_trabajador;
drop policy if exists "avance_trabajador_update" on public.avance_trabajador;
drop policy if exists "avance_trabajador_delete" on public.avance_trabajador;

create policy "avance_trabajador_select" on public.avance_trabajador
  for select
  using (
    id_empresa = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy "avance_trabajador_insert" on public.avance_trabajador
  for insert
  with check (
    id_empresa = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy "avance_trabajador_update" on public.avance_trabajador
  for update
  using (
    id_empresa = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  )
  with check (
    id_empresa = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );

create policy "avance_trabajador_delete" on public.avance_trabajador
  for delete
  using (
    id_empresa = public.clerk_org_id()
    or public.es_org_plataforma_inducta()
  );
