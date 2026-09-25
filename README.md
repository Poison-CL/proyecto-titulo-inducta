# Inducta CHILE

Proyecto de título: plataforma web para gestionar **inducciones y capacitaciones** del personal en empresas de Chile.

## ¿De qué se trata?

Inducta Chile ayuda a las empresas a ordenar el ingreso y la formación de colaboradores: programas por cargo o área, seguimiento del avance de cada persona y evidencia lista para auditorías.

En la práctica, la plataforma:

- Centraliza inducciones y capacitaciones en un solo lugar
- Asigna programas según cargo, área o normativa
- Registra quién completó cada etapa y en qué fecha
- Separa accesos de **empresa** (administración) y **empleado** (programas asignados)
- Ofrece planes contratables con pago vía Transbank (precios en UF)

Este repositorio agrupa el código de la aplicación, la documentación técnica y las evidencias académicas de la Fase 1 del proyecto de título.

### Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Vite + Chakra UI |
| Auth | Clerk (roles empresa / empleado) |
| Datos | Supabase (Postgres) |
| Pagos | Transbank |
| Contenedor (opcional) | Podman + Compose |

## Estructura del repositorio

```
proyecto-titulo-inducta/
├── Desarrollo de Documentacion/     # Guías y requisitos
│   ├── CLERK-EMPRESA-EMPLEADO.md
│   ├── INSTALACION-PODMAN.md
│   └── requirements.txt
├── Desarrollo_Proyecto/             # Código
│   ├── inducta-chile/               # App web + Podman + Supabase
│   │   ├── src/
│   │   │   ├── app/                 # shell, providers, router
│   │   │   ├── components/          # auth/ y site/
│   │   │   ├── features/            # lógica por dominio
│   │   │   ├── pages/
│   │   │   │   ├── public/          # home, precios, contacto…
│   │   │   │   ├── auth/            # entrar, post-login, acceso
│   │   │   │   └── app/             # dashboard
│   │   │   ├── lib/                 # env, supabase, auth, planes
│   │   │   └── …
│   │   ├── tests/unit/              # pruebas (node assert)
│   │   ├── supabase/                # migraciones y edge functions
│   │   ├── container/               # nginx
│   │   ├── Containerfile
│   │   └── compose.yml
│   └── supabase/                    # link/config local de Supabase
├── FASE 1/                          # Evidencias académicas
│   ├── Evidencias grupales/
│   └── Evidencias Individuales/
├── package.json                     # Scripts npm desde la raíz
└── README.md
```

Detalle de carpetas de la app: [Desarrollo_Proyecto/inducta-chile/README.md](Desarrollo_Proyecto/inducta-chile/README.md).

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (incluye `npm`)
- Cuentas de [Clerk](https://dashboard.clerk.com) y [Supabase](https://supabase.com/dashboard)
- (Opcional) [Podman Desktop](https://podman-desktop.io/) + `podman-compose` (`pip install podman-compose`)

Lista completa: [`Desarrollo de Documentacion/requirements.txt`](Desarrollo%20de%20Documentacion/requirements.txt).

## Instalación rápida

Desde la raíz del repo:

```bash
npm install --prefix Desarrollo_Proyecto/inducta-chile
```

Copia el entorno (Windows):

```powershell
copy Desarrollo_Proyecto\inducta-chile\.env.example Desarrollo_Proyecto\inducta-chile\.env
```

Edita `.env` con tus claves de Clerk y Supabase.

## Arrancar (desarrollo)

Desde la raíz:

```bash
npm run dev
```

Queda en http://localhost:5173/

Otros scripts (desde la raíz o desde `inducta-chile`):

```bash
npm run build      # build de producción
npm run preview    # servir el build
```

Dentro de `Desarrollo_Proyecto/inducta-chile`:

```bash
npm run lint       # ESLint
npm run test       # pruebas unitarias (auth)
```

## Arrancar con Podman (contenedor)

```powershell
cd Desarrollo_Proyecto\inducta-chile
podman compose up --build
```

App en http://localhost:8080 — guía completa: [INSTALACION-PODMAN.md](Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md).

## Documentación

| Documento | Contenido |
|---|---|
| [README de la app](Desarrollo_Proyecto/inducta-chile/README.md) | Setup local, estructura de `src/`, comandos |
| [Instalación Podman](Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md) | Contenedor en `http://localhost:8080` |
| [Clerk Empresa/Empleado](Desarrollo%20de%20Documentacion/CLERK-EMPRESA-EMPLEADO.md) | Roles y organizaciones |
