# Instalación Podman — Inducta CHILE

Guía para la **demo de deploy**. Al terminar, la app debe responder en `http://localhost:8080`.

Clerk y Supabase viven en la nube. El contenedor solo sirve el frontend.

---

## Antes del día de la demo (hazlo una vez)

1. Instalar [Podman Desktop](https://podman-desktop.io/) y abrirlo al menos una vez.
2. Tener Node 20+ si también quieres `npm run dev`.
3. Tener las 3 claves en un `.env` listo (Clerk + Supabase).
4. En Clerk, permitir origen `http://localhost:8080`.

---

## Script de la demo (orden exacto)

Abre **PowerShell** en el repo.

### 1. Ir a la app

```powershell
cd Desarrollo_Proyecto\inducta-chile
```

Debes ver `package.json`, `Containerfile` y `compose.yml`.

### 2. Arrancar Podman

Abre Podman Desktop. Luego:

```powershell
podman machine start
podman -v
podman compose version
```

Si `podman machine start` dice que ya está corriendo, sigue.

Si `podman compose` no existe:

```powershell
pip install podman-compose
```

Cierra y reabre la terminal.

### 3. Variables de entorno

```powershell
copy .env.example .env
notepad .env
```

Deja exactamente estas 3 líneas con valores reales:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...
```

### 4. Build y deploy

```powershell
podman compose up --build
```

La primera vez puede tardar varios minutos. Cuando termine, abre:

[http://localhost:8080](http://localhost:8080)

Debes ver la landing. Entrar: [http://localhost:8080/entrar](http://localhost:8080/entrar)

### 5. Parar al final

```powershell
podman compose down
```

---

## Alternativa sin contenedor (desarrollo)

```powershell
cd Desarrollo_Proyecto\inducta-chile
copy .env.example .env
npm install
npm run dev
```

URL: [http://localhost:5173](http://localhost:5173)

---

## Comandos útiles

| Acción | Comando |
|---|---|
| Estado | `podman compose ps` |
| Logs | `podman compose logs -f web` |
| Reconstruir tras cambiar `.env` | `podman compose up --build` |
| Build limpio | `podman compose build --no-cache` y luego `podman compose up` |
| Parar | `podman compose down` |

---

## Si sale error en la demo

| Síntoma | Qué hacer |
|---|---|
| `Cannot connect to Podman` | Abrir Podman Desktop + `podman machine start` |
| `podman` no se reconoce | Cerrar terminal, abrir otra; o reiniciar PC |
| Puerto 8080 ocupado | `podman compose down` o cambiar `"8080:80"` en `compose.yml` |
| Pantalla en blanco / sin Clerk | Revisar `.env` y reconstruir: `podman compose up --build` |
| Clerk rechaza el login | Agregar `http://localhost:8080` en orígenes permitidos de Clerk |
| Build falla en `npm ci` | Internet activo; `podman compose build --no-cache` |
| Contenedor se cae | `podman compose logs web` |

---

## Checklist express (5 minutos antes)

1. Podman Desktop abierto
2. `podman machine start` OK
3. Estás en `Desarrollo_Proyecto\inducta-chile`
4. `.env` con las 3 variables llenas
5. `podman compose up --build` sin error
6. [http://localhost:8080](http://localhost:8080) carga
