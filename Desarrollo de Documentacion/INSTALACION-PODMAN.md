# Instalación Podman — Inducta CHILE

Guía para dejar el proyecto corriendo en un equipo nuevo con Podman.
Aplica a Windows, macOS y Linux. Al terminar, la app debe responder en `http://localhost:8080`.

---

## Objetivo

1. Tener Podman (con Compose) operativo.
2. Configurar el archivo `.env` en la raíz del proyecto.
3. Construir la imagen y levantar el contenedor `web`.
4. Verificar que el login de Clerk carga en el navegador.

Clerk y Supabase viven en la nube. No se levantan en el contenedor; solo se necesita la red y las claves del `.env`.

---

## Requisitos previos

| Herramienta | Uso | Notas |
|---|---|---|
| Git | Clonar el repositorio | https://git-scm.com |
| Podman Desktop | Construir y ejecutar el contenedor | https://podman-desktop.io/ |
| Cuenta Clerk | Autenticación | Dashboard → Publishable key |
| Proyecto Supabase | Base de datos | URL + anon/publishable key |

En Windows, Podman Desktop instala una máquina virtual ligera.

---

## 1. Clonar e ingresar al proyecto

```bash
git clone <url-del-repositorio>
cd Desarrollo_Proyecto/inducta-chile
```

La carpeta de trabajo debe contener `package.json`, `Containerfile` y `compose.yml`.

---

## 2. Instalar y arrancar Podman

### Windows / macOS

1. Instalar [Podman Desktop](https://podman-desktop.io/).
2. Abrir Podman Desktop y esperar a que el motor quede en marcha (máquina Podman iniciada).
3. En una terminal nueva, comprobar:

```bash
podman -v
podman compose version
```

Si `podman compose` dice que no encuentra el proveedor, instala:

```bash
pip install podman-compose
```

Cierra y reabre la terminal, o agrega al PATH la carpeta `Scripts` de Python (ej. `%LOCALAPPDATA%\Programs\Python\Python312\Scripts`).

Si el comando no se reconoce, cerrar y reabrir la terminal, o reiniciar el equipo después de la instalación.

### Linux

```bash
# Ejemplo Ubuntu/Debian — ajustar según la distro
sudo apt-get update
sudo apt-get install -y podman podman-compose
```

Luego:

```bash
podman -v
podman compose version
```

Si `podman compose` no está disponible, usa `podman-compose` (mismo uso).

---

## 3. Variables de entorno

En la raíz del proyecto (junto a `package.json`), crear `.env` a partir del ejemplo:

```bash
# Windows PowerShell
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Completar `.env` con valores reales:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
VITE_SUPABASE_ANON_KEY=sb_publishable_...
```

Reglas:

- El archivo se llama `.env` y vive en la raíz, nunca dentro de `src/`.
- No subir `.env` a Git (ya está en `.gitignore`).
- Las variables `VITE_*` se inyectan en el **build** de la imagen. Si cambian, hay que reconstruir.

Opcional en desarrollo local (sin contenedor): también sirve `.env.local` con el mismo contenido; Vite lo lee al hacer `npm run dev`.

---

## 4. Construir y levantar el contenedor

Desde la raíz del proyecto (`inducta-chile`), con Podman en marcha:

```bash
podman compose up --build
```

La primera vez descarga imágenes base (`node`, `nginx`) e instala dependencias; puede tardar varios minutos.

Resultado esperado:

- Imagen local: `inducta-chile-web` (o similar)
- Contenedor: `inducta-chile-web-1` (o similar)
- Puerto publicado: `8080 → 80`

En segundo plano:

```bash
podman compose up --build -d
```

Ver logs:

```bash
podman compose logs -f web
```

---

## 5. Verificar que funciona

1. Abrir [http://localhost:8080](http://localhost:8080).
2. Debe redirigir a `/sign-in` y mostrar el formulario de Clerk.
3. En Podman Desktop → **Containers**, el servicio `web` debe estar en marcha.
4. Comprobación rápida por terminal:

```bash
podman compose ps
curl -I http://localhost:8080
```

Si `curl` no existe en Windows, basta con abrir la URL en el navegador.

---

## 6. Comandos de mantenimiento

| Acción | Comando |
|---|---|
| Parar | `podman compose down` |
| Reconstruir tras cambiar `.env` o código | `podman compose up --build` |
| Reconstruir forzado | `podman compose build --no-cache` y luego `podman compose up` |
| Ver contenedores | `podman compose ps` |
| Limpiar contenedor e imagen del proyecto | `podman compose down --rmi local` |

---

## 7. Problemas frecuentes

| Síntoma | Qué revisar |
|---|---|
| `podman` no se reconoce | Podman Desktop cerrado o PATH sin actualizar; reiniciar terminal/PC |
| Máquina Podman detenida | Abrir Podman Desktop e iniciar la máquina / el motor |
| Puerto 8080 ocupado | Cambiar `"8080:80"` en `compose.yml` o liberar el puerto |
| Pantalla en blanco / sin Clerk | `.env` vacío o mal ubicado; reconstruir con `podman compose up --build` |
| Error al autenticarse en Clerk | En el dashboard de Clerk, permitir `http://localhost:8080` como origen |
| Build falla en `npm ci` | Conexión a internet; borrar caché y `podman compose build --no-cache` |
| Contenedor sale y se detiene | `podman compose logs web` y revisar `container/nginx.conf` |

---

## 8. Checklist por equipo

- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Podman Desktop / Podman instalado y en marcha
- [ ] `podman -v` y `podman compose version` responden
- [ ] Archivo `.env` creado en la raíz con las cuatro variables `VITE_*`
- [ ] `podman compose up --build` termina sin error
- [ ] [http://localhost:8080](http://localhost:8080) muestra el login de Clerk

Cuando todos los ítems están marcados, el entorno Podman de ese equipo queda listo.
