-- clerk_org_role leía request.jwt.claims (vacío con JWT Clerk / third-party).
-- Alinear a auth.jwt() como clerk_org_id (migración 013).
create or replace function public.clerk_org_role()
returns text
language sql
stable
set search_path = ''
as $$
  select coalesce(
    nullif(auth.jwt()->>'org_role', ''),
    nullif(auth.jwt()->'o'->>'rol', ''),
    nullif(auth.jwt()->'o'->>'role', '')
  );
$$;

-- Roles admin reconocidos (Clerk custom + defaults)
create or replace function public.es_admin_empresa()
returns boolean
language sql
stable
set search_path = ''
as $$
  select public.clerk_org_role() in (
    'org:admin',
    'org:administrador_empresa',
    'org:administrador_inducta',
    'admin',
    'administrador_inducta',
    'administrador_empresa'
  )
  or public.es_org_plataforma_inducta();
$$;
