-- Persistencia del resultado de la evaluación (nota %) para verlo en progreso sin depender del localStorage.
alter table avance_trabajador
  add column if not exists puntaje integer
    check (puntaje is null or (puntaje between 0 and 100));

alter table avance_trabajador
  add column if not exists intentos integer not null default 0
    check (intentos >= 0);
