-- N-P1-1: eliminar RPC SECURITY DEFINER que aceptaba estado/puntaje del cliente
drop function if exists public.upsert_avance_trabajador(
  bigint, text, text, text, timestamptz, int, int, text, text, jsonb
);
drop function if exists public.upsert_avance_trabajador(
  bigint, text, text, text, timestamptz, numeric, int, text, text, jsonb
);
drop function if exists public.upsert_avance_trabajador;

revoke execute on function public.rls_auto_enable() from anon, authenticated, public;
