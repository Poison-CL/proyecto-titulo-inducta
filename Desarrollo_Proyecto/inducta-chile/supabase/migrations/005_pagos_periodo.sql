alter table pagos_transbank add column if not exists periodo text;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'pagos_periodo_check') then
    alter table pagos_transbank add constraint pagos_periodo_check
      check (periodo is null or periodo in ('mensual', 'anual'));
  end if;
end $$;
