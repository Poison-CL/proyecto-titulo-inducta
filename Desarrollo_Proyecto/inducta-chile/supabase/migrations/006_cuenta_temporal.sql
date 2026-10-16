-- Cuentas temporales post-pago. El pago queda como referencia histórica.
alter table empresa add column if not exists cuenta_estado text;
alter table empresa add column if not exists cuenta_temporal_creada_en timestamptz;
alter table empresa add column if not exists cuenta_deshabilitada_en timestamptz;
alter table empresa add column if not exists email_temporal text;
alter table empresa add column if not exists clerk_user_id text;
alter table empresa add column if not exists modal_temporal_visto boolean not null default false;
alter table empresa add column if not exists id_pago_origen integer;

update empresa set cuenta_estado = 'verificada' where cuenta_estado is null;

alter table empresa alter column cuenta_estado set default 'verificada';
alter table empresa alter column cuenta_estado set not null;

do $$
begin
  if not exists (select 1 from pg_constraint where conname = 'empresa_cuenta_estado_check') then
    alter table empresa add constraint empresa_cuenta_estado_check
      check (cuenta_estado in ('temporal', 'pendiente_verificacion', 'verificada', 'deshabilitada'));
  end if;
end $$;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'empresa_id_pago_origen_fkey'
  ) then
    alter table empresa
      add constraint empresa_id_pago_origen_fkey
      foreign key (id_pago_origen) references pagos_transbank(id_pago) on delete set null;
  end if;
end $$;

create index if not exists empresa_cuenta_estado_idx on empresa (cuenta_estado);
create index if not exists empresa_temporal_creada_idx on empresa (cuenta_temporal_creada_en)
  where cuenta_estado in ('temporal', 'pendiente_verificacion', 'deshabilitada');
