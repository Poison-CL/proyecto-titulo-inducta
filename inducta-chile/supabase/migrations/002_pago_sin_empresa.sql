-- El checkout no crea empresa. La cuenta la manda Inducta a mano cuando el pago queda pagado.
alter table pagos_transbank add column if not exists nombre_comercial text;
alter table pagos_transbank add column if not exists email_contacto text;
alter table pagos_transbank alter column id_empresa drop not null;
