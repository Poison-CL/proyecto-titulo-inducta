# Flujo de autenticacion Empresa / Empleado (Clerk)

Rediseño frontend. El backend y Supabase no se tocan.

## Decision de arquitectura

| Enfoque | Uso en Inducta |
|---|---|
| Login custom en `/entrar` con toggle Empresa/Empleado | **Si.** UI propia (no widget Clerk embebido). |
| Clerk `useSignIn` | **Si.** Autenticacion real sin registro publico. |
| Clerk Organizations | **Si.** Fuente de verdad de “pertenece a una empresa”. |
| `unsafeMetadata.rol` / `publicMetadata.rol` | Preferencia de UI. El **acceso** lo decide la membresia de Organization. |
| Registro publico | **No.** |

---

## 1. User journey

### Empresa / Empleado (mismo formulario)

1. Navbar → Entrar → Empresa o Empleado (preselecciona el toggle).
2. `/entrar?rol=empresa|empleado`: tarjeta con toggle, correo, contraseña, “Iniciar sesion”.
3. Credenciales invalidas → error en la misma tarjeta (no redirige a otro login).
4. Login ok → `/post-login` → org activa → `/dashboard`.
5. Sin Organization → `/acceso/sin-empresa` o `/acceso/sin-membresia`.

---

## 2. Enrutamiento y guards

```
Publico:     /  /precios  /recursos  /contacto
Auth UX:     /entrar  /entrar/empresa  /entrar/empleado  /post-login
Acceso:      /acceso/sin-empresa  /acceso/sin-membresia  /acceso/registro
App:         /dashboard  → RequireAuth → RequireOrg → AdminLayout
```

- **`RequireAuth`**: si no hay sesion → `/entrar` (o ultimo rol).
- **`RequireOrg`**: si hay membresias sin org activa → `setActive`; si no hay ninguna → `/acceso/sin-*` segun rol.
- **`PostLoginPage`**: unico puente post-Clerk; evita dejar al usuario en el formulario de login.
- Alias: `/sign-in` → `/entrar`, `/sign-up` → `/acceso/registro`.

---

## 3. Textos UX (fuente: `src/lib/authCopy.js`)

### Sin empresa (autenticado)

- Titulo: **Tu cuenta no tiene una empresa asociada**
- Cuerpo: Las cuentas de empresa las crea Inducta segun el plan. Si no esta dada de alta, contrata un plan o agenda una demo.
- CTAs: Ver planes · Agendar demo · Cerrar sesion

### Sin membresia (empleado autenticado)

- Titulo: **No perteneces a ninguna empresa**
- Cuerpo: Iniciaste sesion, pero no estas vinculado a una organizacion. Contacta al soporte interno de tu empresa…
- CTAs: Contactar Inducta · Volver al inicio · Cerrar sesion

### Registro bloqueado

- Titulo: **No hay registro publico**
- CTAs: Ver planes · Agendar demo · Volver al ingreso

### Loading

- Validando tu sesion…
- Preparando tu acceso…
- Cargando tu empresa…

---

## 4. Piezas de codigo

| Archivo | Rol |
|---|---|
| `src/lib/authCopy.js` | Textos y rutas |
| `src/lib/authRol.js` | Rol pendiente / metadata |
| `src/pages/EntrarPage.jsx` | Selector |
| `src/pages/SignInRolPage.jsx` | SignIn por rol |
| `src/pages/PostLoginPage.jsx` | Resolucion post-login |
| `src/pages/AccesoPages.jsx` | Estados de bloqueo |
| `src/components/auth/RequireAuth.jsx` | Guard sesion |
| `src/components/auth/RequireOrg.jsx` | Guard Organization |
| `src/components/auth/AuthRolBootstrap.jsx` | Persistencia de rol |

Lectura de rol:

```js
const rol =
  user?.publicMetadata?.rol || // preferido si lo setea backend
  user?.unsafeMetadata?.rol     // puente actual desde el cliente
```

Redirect post SignIn:

```jsx
<SignIn
  path="/entrar/empresa"
  forceRedirectUrl="/post-login"
  fallbackRedirectUrl="/post-login"
  signUpUrl="/acceso/registro"
/>
```

---

## 5. Operacion en Clerk Dashboard

1. Organizations activas.
2. Usuarios empresa: Create user + Create organization + agregar como admin.
3. Empleados: invitacion a la Organization (o alta manual + membership).
4. Desactivar sign-up publico si el plan lo permite.
5. Paths: Sign-in `/entrar`, Sign-up `/acceso/registro`, After sign-in `/post-login`.

---

## 6. Como probar

1. Empresa con org → `/entrar/empresa` → dashboard.
2. Usuario sin org + ingreso empresa → `/acceso/sin-empresa` (sin volver a login).
3. Usuario sin org + ingreso empleado → `/acceso/sin-membresia`.
4. Ir a `/sign-up` → `/acceso/registro`.
5. `/dashboard` sin sesion → `/entrar` (no SignIn roto).
