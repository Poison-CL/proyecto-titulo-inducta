-- Al borrar una evaluación, los avances/certificados del colaborador deben permanecer.
-- Antes: ON DELETE CASCADE borraba avance_trabajador junto con test_induccion.

alter table public.avance_trabajador
  alter column id_test drop not null;

alter table public.avance_trabajador
  drop constraint if exists avance_trabajador_id_test_fkey1;

alter table public.avance_trabajador
  drop constraint if exists avance_trabajador_id_test_fkey;

alter table public.avance_trabajador
  add constraint avance_trabajador_id_test_fkey
  foreign key (id_test) references public.test_induccion(id_test)
  on delete set null;
