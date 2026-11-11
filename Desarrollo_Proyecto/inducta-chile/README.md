# Inducta CHILE

Frontend React (Vite) con autenticación Clerk, datos en Supabase y pagos Transbank.

---

## 1. Qué hay que instalar (una vez)

| Programa | Para qué | Dónde |
|---|---|---|
| [Node.js 20+](https://nodejs.org) | Desarrollo local (`npm run dev`) | https://nodejs.org |
| [Podman Desktop](https://podman-desktop.io/) | Demo / deploy en contenedor (`:8080`) | https://podman-desktop.io/ |
| [Git](https://git-scm.com/download/win) | Clonar el repositorio | https://git-scm.com |

Comprueba en una terminal nueva:

```powershell
node -v
npm -v
podman -v
```

Cuentas en la nube (no se instalan en el PC):

- [Clerk](https://dashboard.clerk.com) — publishable key
- [Supabase](https://supabase.com/dashboard) — Project URL + anon key

---

## 2. Entrar al proyecto

Desde la raíz del repo:

```powershell
cd Desarrollo_Proyecto\inducta-chile
```

Esta carpeta debe tener `package.json`, `Containerfile` y `compose.yml`.

---

## 3. Variables de entorno

```powershell
copy .env.example .env
```

Edita `.env` (junto a `package.json`, nunca dentro de `src/`):

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

En Clerk → Domains / Allowed origins, agrega:

- `http://localhost:5173` (npm)
- `http://localhost:8080` (Podman)

---

## 4. Levantar el proyecto

### Opción A — Podman (demo / deploy)

1. Abre **Podman Desktop** y espera a que el motor esté en marcha.
2. Si `podman` falla al conectar, arranca la máquina:

```powershell
podman machine start
```

3. Desde `inducta-chile`:

```powershell
podman compose up --build
```

4. Abre [http://localhost:8080](http://localhost:8080)

Para parar: `Ctrl+C`, o:

```powershell
podman compose down
```

Guía completa: [INSTALACION-PODMAN.md](../../Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md)

### Opción B — Local con Node (desarrollo)

```powershell
npm install
npm run dev
```

Abre [http://localhost:5173](http://localhost:5173)

Si cambias el `.env`, detén el servidor (`Ctrl+C`) y vuelve a correr `npm run dev`.

---

## 5. Otros comandos

```powershell
npm run test       # pruebas unitarias
npm run build      # genera dist/
npm run preview    # sirve el build en local
npm run lint
podman compose down
```

---

## 6. Estructura del proyecto

```
inducta-chile/
├── container/
│   └── nginx.conf          # SPA routing en el contenedor
├── public/
├── src/
│   ├── app/                # App, providers, router
│   ├── pages/              # pantallas por dominio
│   ├── components/
│   ├── layouts/
│   ├── lib/                # env, auth, supabase
│   └── main.jsx
├── supabase/
│   ├── migrations/
│   └── functions/          # Edge Functions Transbank
├── tests/
├── Containerfile
├── compose.yml
├── .env.example
└── README.md
```

| Carpeta | Qué va ahí |
|---|---|
| `src/app` | Arranque, providers y rutas |
| `src/pages` | Landing, acceso, dashboard |
| `src/lib` | Env, Clerk helpers, cliente Supabase |
| `supabase/migrations` | SQL versionado |
| `supabase/functions` | Pagos Transbank |
| `container/` | Config nginx del contenedor |

---

## 7. Qué incluye la app hoy

### Sitio público
- Home, Precios (UF + IVA), Contacto, hub `/recursos` (guías, documentación, capacitaciones, cumplimiento, soporte)

### Panel empresa (`/dashboard`)
- **Programas**: crear/editar evaluaciones, niveles de estudio (texto / YouTube), publicar
- **Avances** (pestaña en Programas): matriz trabajadores × inducciones, export CSV
- **Equipo**: invitaciones y cupos según plan
- **Configuración**: plan y datos de contacto

### Panel empleado (`/empleado`)
- **Mis programas**: estudiar (Completar y seguir) → rendir cuando el estudio está al 100 %
- **Mis certificados**: constancia al aprobar
- Inicio y perfil

### Seguridad y pagos
- Clerk Organizations (JWT + `org_id`) + RLS en Supabase
- Calificación y publicación de avance vía Edge Function `publicar-avance` (no se confía en el cliente)
- Webpay: monto en servidor (`tbk-iniciar` / `tbk-confirmar`); UF con cascada mindicador → indicadores.cl → fallback
- Cuenta temporal post-pago + SMTP; antiduplicado de correo al iniciar cobro
- Login `@tmp…` sin código (ticket `login-ticket-temporal`)

Demo en Render: https://inducta-chile.onrender.com

Documentación de usuario: artículos en `src/lib/recursos.js` (visibles en `/recursos`).

---

## 8. Funciones desplegadas permitidas

Edge Functions que deben permanecer en el proyecto Supabase:

- `tbk-iniciar`
- `tbk-confirmar`
- `provisionar-cuenta-temporal`
- `completar-cuenta-temporal`
- `limpiar-cuentas-temporales`
- `login-ticket-temporal`
- `responder-contacto`
- `admin-reset-password`
- `publicar-avance`

Funciones de prueba o utilidades puntuales que **no** deben quedar desplegadas en producción (eliminar del proyecto si existen):

```powershell
supabase functions delete test-smtp
supabase functions delete test-resend
supabase functions delete prep-fix-test-user
supabase functions delete crear-org-administradores
```
