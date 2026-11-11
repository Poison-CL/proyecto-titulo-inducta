-- Compatibilidad JWT Clerk v1 (org_id) y v2 (o.id) para RLS multi-tenant.
create or replace function public.clerk_org_id()
returns text
language sql
stable
as $$
  select coalesce(
    nullif(auth.jwt() ->> 'org_id', ''),
    nullif(auth.jwt() -> 'o' ->> 'id', ''),
    nullif(auth.jwt() ->> 'organization_id', '')
  );
$$;
