-- Vencimiento y periodo del plan contratado (demo incluido).
alter table empresa add column if not exists plan_vence_en date;
alter table empresa add column if not exists periodo text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'empresa_periodo_check'
  ) then
    alter table empresa add constraint empresa_periodo_check
      check (periodo is null or periodo in ('mensual', 'anual'));
  end if;
end $$;
