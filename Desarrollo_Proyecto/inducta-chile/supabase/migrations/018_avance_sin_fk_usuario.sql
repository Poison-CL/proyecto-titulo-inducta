-- id_usuario en avance_trabajador es el Clerk user id.
-- La tabla usuario casi no se usa para colaboradores invitados → el FK bloqueaba TODO insert de avance.
alter table public.avance_trabajador
  drop constraint if exists avance_trabajador_id_usuario_fkey1;

alter table public.avance_trabajador
  drop constraint if exists avance_trabajador_id_usuario_fkey;
