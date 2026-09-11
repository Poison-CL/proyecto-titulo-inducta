# Inducta CHILE

Frontend React (Vite) con autenticación Clerk, datos en Supabase y pagos Transbank.

---

## 1. Qué hay que instalar

Hazlo **una vez** en el PC.

| Programa | Para qué | Dónde bajarlo |
|---|---|---|
| [Node.js 22 LTS](https://nodejs.org) | Corre la app sin Docker. Incluye `npm`. | https://nodejs.org |
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | Levanta todo con un comando. | https://www.docker.com/products/docker-desktop/ |
| [Git](https://git-scm.com/download/win) | Clonar el repositorio. | https://git-scm.com/download/win |

Después de instalar Node, cierra y abre la terminal y comprueba:

```powershell
node -v
npm -v
```

Después de instalar Docker Desktop, **ábrelo y espera** a que diga que está en marcha. Comprueba:

```powershell
docker -v
docker compose version
```

También necesitas cuentas (son servicios en la nube, no se instalan):

- [Clerk](https://dashboard.clerk.com) — login Empresa/Empleado (`docs/CLERK-EMPRESA-EMPLEADO.md`)
- [Supabase](https://supabase.com/dashboard) — base de datos

---

## 2. Entrar al proyecto

```powershell
cd ruta\del\repo\inducta-chile
```

Tienes que estar en la carpeta que tiene `package.json` y `docker-compose.yml`.

---

## 3. Variables de entorno

Las claves van en la **raíz** (junto a `package.json`), nunca en `src/`.

```powershell
copy .env.example .env
```

Abre `.env` y pega tus claves:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

---

## 4. Levantar el proyecto

Guía detallada por equipo (Docker Desktop, `.env`, verificación y problemas frecuentes): [docs/INSTALACION-DOCKER.md](docs/INSTALACION-DOCKER.md).

### Opción A — Docker (la que piden para compartir el proyecto)

1. Abre Docker Desktop y espera a que inicie.
2. En la carpeta del proyecto:

```powershell
docker compose up --build
```

3. Abre el navegador en [http://localhost:8080](http://localhost:8080)

Para parar: `Ctrl+C` en la terminal, o:

```powershell
docker compose down
```

Clerk y Supabase siguen en la nube. El contenedor solo sirve la web.

### Opción B — Local con Node (desarrollo)

```powershell
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

Si cambias el `.env`, para el servidor (`Ctrl+C`) y vuelve a correr `npm run dev`.

---

## 5. Otros comandos

```powershell
npm run build      # genera la carpeta dist
npm run preview    # sirve el build en local
npm run lint       # revisa el código
docker compose down
```

---

## 6. Estructura del proyecto

```
inducta-chile/
├── docker/
│   └── nginx.conf          # SPA routing en producción
├── public/                 # estáticos públicos
├── src/
│   ├── app/                # shell de la app
│   │   ├── App.jsx
│   │   ├── providers.jsx   # Clerk + Saas UI
│   │   └── router.jsx      # rutas
│   ├── pages/              # pantallas por ruta
│   │   ├── LandingPage.jsx
│   │   └── DashboardPage.jsx
│   ├── components/
│   │   └── landing/        # navbar, hero, footer
│   ├── theme/              # paleta Saas UI
│   ├── layouts/            # shells (sidebar, etc.)
│   │   └── AdminLayout.jsx
│   ├── features/           # lógica de negocio por dominio
│   │   └── empresa/
│   ├── hooks/              # hooks reutilizables
│   ├── lib/                # clientes e infraestructura
│   ├── services/           # integraciones externas (Transbank)
│   ├── styles/
│   └── main.jsx
├── supabase/
│   └── migrations/         # esquema SQL
├── Dockerfile
├── docker-compose.yml
├── .env.example
└── README.md
```

| Carpeta | Qué va ahí |
|---|---|
| `src/app` | Arranque, providers y rutas |
| `src/pages` | Landing, dashboard y pantallas |
| `src/components/landing` | Navbar, hero, footer |
| `src/theme` | Colores y tema Saas UI |
| `src/layouts` | Marcos compartidos (sidebar) |
| `src/features` | Reglas de negocio por dominio |
| `src/lib` | Env, cliente Supabase |
| `src/services` | APIs externas (Transbank) |
| `supabase/migrations` | SQL versionado |
| `docker/` | Config del contenedor |
