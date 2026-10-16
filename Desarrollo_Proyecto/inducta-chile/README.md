# Inducta CHILE — App

Frontend de la plataforma **Inducta Chile**: inducción y capacitación laboral para empresas en Chile.

Parte del [proyecto de título](../../README.md). Esta carpeta es el código de la aplicación web.

## ¿Qué hace esta app?

- Sitio público: landing, precios, contratar, contacto y recursos
- Acceso separado para **empresa** y **empleado** (Clerk)
- Panel autenticado (dashboard) tras login
- Datos en Supabase; pagos de planes con Transbank (UF)

### Stack

| Capa | Tecnología |
|---|---|
| UI | React 19 + Vite + Chakra UI |
| Auth | Clerk (roles empresa / empleado) |
| Datos | Supabase (Postgres + edge functions) |
| Pagos | Transbank SDK |
| Contenedor | Podman (`Containerfile` + `compose.yml`) |

---

## 1. Qué hay que instalar

Hazlo **una vez** en el PC.

| Programa | Para qué | Dónde bajarlo |
|---|---|---|
| [Node.js 22 LTS](https://nodejs.org) | Desarrollo local. Incluye `npm`. | https://nodejs.org |
| [Podman Desktop](https://podman-desktop.io/) | Levantar la app en contenedor | https://podman-desktop.io/ |
| [Git](https://git-scm.com/download/win) | Clonar el repositorio | https://git-scm.com/download/win |
| Python + `pip` | Instalar `podman-compose` | ya suele venir en Windows / Store |

Después de instalar Node:

```powershell
node -v
npm -v
```

Después de instalar Podman Desktop, ábrelo, completa el **Set up** y comprueba:

```powershell
podman -v
podman compose version
```

Si `podman compose` no encuentra proveedor:

```powershell
pip install podman-compose
```

Cierra y reabre la terminal (o refresca el PATH).

Cuentas en la nube (no se instalan):

- [Clerk](https://dashboard.clerk.com) — login Empresa/Empleado ([guía](../../Desarrollo%20de%20Documentacion/CLERK-EMPRESA-EMPLEADO.md))
- [Supabase](https://supabase.com/dashboard) — base de datos

---

## 2. Entrar al proyecto

```powershell
cd ruta\del\repo\Desarrollo_Proyecto\inducta-chile
```

Debes estar en la carpeta que tiene `package.json`, `Containerfile` y `compose.yml`.

---

## 3. Variables de entorno

Las claves van en la **raíz de esta carpeta** (junto a `package.json`), nunca dentro de `src/`.

```powershell
copy .env.example .env
```

Completa `.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 4. Levantar el proyecto

Guía detallada de contenedor: [INSTALACION-PODMAN.md](../../Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md).

### Opción A — Podman (compartir / demo en contenedor)

1. Podman Desktop con el motor en marcha.
2. En esta carpeta:

```powershell
podman compose up --build
```

3. Abrir [http://localhost:8080](http://localhost:8080)

Para parar: `Ctrl+C`, o:

```powershell
podman compose down
```

Clerk y Supabase siguen en la nube; el contenedor solo sirve la web.

### Opción B — Local con Node (desarrollo diario)

```powershell
npm install
npm run dev
```

Abrir [http://localhost:5173](http://localhost:5173)

Si cambias el `.env`, reinicia el servidor (`Ctrl+C` y otra vez `npm run dev`).

---

## 5. Comandos útiles

```powershell
npm run dev        # desarrollo (Vite)
npm run build      # genera dist/
npm run preview    # sirve el build
npm run lint       # ESLint
npm run test       # pruebas unitarias (auth)
podman compose down
```

---

## 6. Estructura

```
inducta-chile/
├── container/                 # nginx del contenedor Podman
├── public/                    # estáticos públicos
├── src/
│   ├── app/                   # App, providers, router
│   ├── components/
│   │   ├── auth/              # guards, botones de sesión
│   │   └── site/              # navbar, hero, footer, FAQ
│   ├── features/
│   │   └── empresa/           # lógica de dominio empresa
│   ├── hooks/
│   ├── layouts/               # SiteLayout, AdminLayout
│   ├── lib/                   # env, supabase, auth, planes, chile
│   ├── pages/
│   │   ├── public/            # home, precios, contratar, contacto…
│   │   ├── auth/              # entrar, post-login, acceso restringido
│   │   └── app/               # dashboard (panel)
│   ├── services/              # Transbank
│   ├── styles/
│   ├── theme/
│   └── main.jsx
├── tests/
│   └── unit/                  # node assert (sin framework)
│       └── auth.test.js
├── supabase/
│   ├── migrations/
│   └── functions/             # tbk-iniciar, tbk-confirmar
├── Containerfile
├── compose.yml
├── .env.example
└── README.md
```

| Carpeta | Qué va ahí |
|---|---|
| `src/app` | Arranque, providers y rutas |
| `src/pages/public` | Landing y páginas públicas |
| `src/pages/auth` | Login y pantallas de acceso |
| `src/pages/app` | Panel tras autenticarse |
| `src/components/site` | Navbar, hero, footer |
| `src/components/auth` | Guards y UI de sesión |
| `src/features` | Reglas de negocio por dominio |
| `src/lib` | Env, Supabase, auth, planes |
| `src/services` | APIs externas (Transbank) |
| `tests/unit` | Checks de lógica (auth, etc.) |
| `supabase/` | Migraciones SQL y edge functions |
| `container/` | Config nginx del contenedor |

---

## Documentación relacionada

| Documento | Contenido |
|---|---|
| [README del repo](../../README.md) | Contexto del proyecto de título |
| [Instalación Podman](../../Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md) | Contenedor paso a paso |
| [Clerk Empresa/Empleado](../../Desarrollo%20de%20Documentacion/CLERK-EMPRESA-EMPLEADO.md) | Roles y organizaciones |
