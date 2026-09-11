# Instalación Docker — Inducta CHILE

Guía para dejar el proyecto corriendo en un equipo nuevo con Docker.
Aplica a Windows, macOS y Linux. Al terminar, la app debe responder en `http://localhost:8080`.

---

## Objetivo

1. Tener Docker Desktop (o Docker Engine + Compose) operativo.
2. Configurar el archivo `.env` en la raíz del proyecto.
3. Construir la imagen y levantar el contenedor `web`.
4. Verificar que el login de Clerk carga en el navegador.

Clerk y Supabase viven en la nube. No se levantan en el contenedor; solo se necesita la red y las claves del `.env`.

---

## Requisitos previos

| Herramienta | Uso | Notas |
|---|---|---|
| Git | Clonar el repositorio | https://git-scm.com |
| Docker Desktop | Construir y ejecutar el contenedor | https://www.docker.com/products/docker-desktop/ |
| Cuenta Clerk | Autenticación | Dashboard → Publishable key |
| Proyecto Supabase | Base de datos | URL + anon/publishable key |

En Windows hace falta WSL 2 habilitado (Docker Desktop lo solicita al instalar).
En Linux se puede usar Docker Engine + el plugin Compose en lugar de Docker Desktop.

---

## 1. Clonar e ingresar al proyecto

```bash
git clone <url-del-repositorio>
cd inducta-chile
```

La carpeta de trabajo debe contener `package.json`, `Dockerfile` y `docker-compose.yml`.

---

## 2. Instalar y arrancar Docker

### Windows / macOS

1. Instalar [Docker Desktop](https://www.docker.com/products/docker-desktop/).
2. Abrir Docker Desktop y esperar a que el estado diga **Engine running**.
3. En una terminal nueva, comprobar:

```bash
docker -v
docker compose version
```

Si el comando no se reconoce, cerrar y reabrir la terminal, o reiniciar el equipo después de la instalación.

### Linux

```bash
# Ejemplo Ubuntu/Debian — ajustar según la distro
sudo apt-get update
sudo apt-get install -y docker.io docker-compose-v2
sudo systemctl enable --now docker
sudo usermod -aG docker $USER
```

Cerrar sesión y volver a entrar para que el grupo `docker` aplique. Luego:

```bash
docker -v
docker compose version
```

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

Opcional en desarrollo local (sin Docker): también sirve `.env.local` con el mismo contenido; Vite lo lee al hacer `npm run dev`.

---

## 4. Construir y levantar el contenedor

Desde la raíz del proyecto, con Docker en marcha:

```bash
docker compose up --build
```

La primera vez descarga imágenes base (`node`, `nginx`) e instala dependencias; puede tardar varios minutos.

Resultado esperado:

- Imagen local: `inducta-chile-web`
- Contenedor: `inducta-chile-web-1` (o similar)
- Puerto publicado: `8080 → 80`

En segundo plano:

```bash
docker compose up --build -d
```

Ver logs:

```bash
docker compose logs -f web
```

---

## 5. Verificar que funciona

1. Abrir [http://localhost:8080](http://localhost:8080).
2. Debe redirigir a `/sign-in` y mostrar el formulario de Clerk.
3. En Docker Desktop → **Containers**, el servicio `web` debe estar en estado Running.
4. Comprobación rápida por terminal:

```bash
docker compose ps
curl -I http://localhost:8080
```

Si `curl` no existe en Windows, basta con abrir la URL en el navegador.

---

## 6. Comandos de mantenimiento

| Acción | Comando |
|---|---|
| Parar | `docker compose down` |
| Reconstruir tras cambiar `.env` o código | `docker compose up --build` |
| Reconstruir forzado | `docker compose build --no-cache` y luego `docker compose up` |
| Ver contenedores | `docker compose ps` |
| Limpiar contenedor e imagen del proyecto | `docker compose down --rmi local` |

---

## 7. Problemas frecuentes

| Síntoma | Qué revisar |
|---|---|
| `docker` no se reconoce | Docker Desktop cerrado o PATH sin actualizar; reiniciar terminal/PC |
| Puerto 8080 ocupado | Cambiar `"8080:80"` en `docker-compose.yml` o liberar el puerto |
| Pantalla en blanco / sin Clerk | `.env` vacío o mal ubicado; reconstruir con `docker compose up --build` |
| Error al autenticarse en Clerk | En el dashboard de Clerk, permitir `http://localhost:8080` como origen |
| Build falla en `npm ci` | Conexión a internet; borrar caché y `docker compose build --no-cache` |
| Contenedor sale y se detiene | `docker compose logs web` y revisar la configuración de nginx |

---

## 8. Checklist por equipo

- [ ] Git instalado
- [ ] Repositorio clonado
- [ ] Docker Desktop / Engine instalado y en marcha
- [ ] `docker -v` y `docker compose version` responden
- [ ] Archivo `.env` creado en la raíz con las cuatro variables `VITE_*`
- [ ] `docker compose up --build` termina sin error
- [ ] [http://localhost:8080](http://localhost:8080) muestra el login de Clerk

Cuando todos los ítems están marcados, el entorno Docker de ese equipo queda listo.
