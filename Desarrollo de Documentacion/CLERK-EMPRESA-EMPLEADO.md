# Flujo de autenticación Empresa / Empleado (Clerk)

Login custom en el frontend. Los datos de negocio viven en Supabase (RLS con JWT de Clerk + `org_id`).

## Decisión de arquitectura

| Enfoque | Uso en Inducta |
|---|---|
| Login custom en `/entrar` con toggle Empresa/Empleado | **Sí.** UI propia (no widget Clerk embebido). |
| Clerk `useSignIn` / verificación por código | **Sí.** Autenticación real sin registro público. |
| Clerk Organizations | **Sí.** Fuente de verdad de “pertenece a una empresa”. |
| `unsafeMetadata.rol` / `publicMetadata.rol` | Preferencia de UI. El **acceso** lo decide la membresía de Organization + rol en la org. |
| Registro público | **No.** Preferible “restricted” / desactivado en Clerk Dashboard. |

---

## 1. User journey

### Empresa / Empleado (mismo formulario)

1. Navbar → Entrar → Empresa o Empleado (preselecciona el toggle).
2. `/entrar?rol=empresa|empleado`: tarjeta con toggle, correo, código o contraseña.
3. Credenciales inválidas → error en la misma tarjeta (no redirige a otro login).
4. Login ok → `/post-login`:
   - Admin de la Organization → `/dashboard`
   - Miembro (empleado) → `/empleado`
5. Sin Organization → `/acceso/sin-empresa` o `/acceso/sin-membresia`.

---

## 2. Enrutamiento y guards

```
Público:     /  /precios  /recursos  /contacto
Auth UX:     /entrar  /entrar/empresa  /entrar/empleado  /post-login
Acceso:      /acceso/sin-empresa  /acceso/sin-membresia  /acceso/registro
Empresa:     /dashboard  /dashboard/programas  /dashboard/equipo  /dashboard/configuracion
Empleado:    /empleado  /empleado/programas  /empleado/certificados  /empleado/perfil
Admin Inducta: /admin/*
```

- **`RequireAuth`**: si no hay sesión → `/entrar` (o último rol).
- **`RequireOrg`**: si hay membresías sin org activa → `setActive`; si no hay ninguna → `/acceso/sin-*` según rol.
- **`ProtectedEmpleado`**: sesión + org; panel del colaborador (no admin de empresa).
- **`PostLoginPage`**: único puente post-Clerk; enruta a dashboard empresa o empleado.
- Alias: `/sign-in` → `/entrar`, `/sign-up` → `/acceso/registro`.
- Redirects de compatibilidad: `/dashboard/avances` → `/dashboard/programas?tab=avances`; `/empleado/progreso` → `/empleado/programas`.

---

## 3. Textos UX (fuente: `src/lib/authCopy.js`)

### Sin empresa (autenticado)

- Título: **Tu cuenta no tiene una empresa asociada**
- Cuerpo: Las cuentas de empresa las crea Inducta según el plan. Si no está dada de alta, contrata un plan o agenda una demo.
- CTAs: Ver planes · Agendar demo · Cerrar sesión

### Sin membresía (empleado autenticado)

- Título: **No perteneces a ninguna empresa**
- Cuerpo: Iniciaste sesión, pero no estás vinculado a una organización. Contacta al soporte interno de tu empresa…
- CTAs: Contactar Inducta · Volver al inicio · Cerrar sesión

### Registro bloqueado

- Título: **No hay registro público**
- CTAs: Ver planes · Agendar demo · Volver al ingreso

### Loading

- Validando tu sesión…
- Preparando tu acceso…
- Cargando tu empresa…

---

## 4. Piezas de código

| Archivo | Rol |
|---|---|
| `src/lib/authCopy.js` | Textos y rutas |
| `src/lib/authRol.js` | Rol pendiente / metadata |
| `src/pages/EntrarPage.jsx` | Selector |
| `src/pages/SignInRolPage.jsx` | SignIn por rol |
| `src/pages/PostLoginPage.jsx` | Resolución post-login |
| `src/pages/AccesoPages.jsx` | Estados de bloqueo |
| `src/components/auth/RequireAuth.jsx` | Guard sesión |
| `src/components/auth/RequireOrg.jsx` | Guard Organization |
| `src/components/auth/AuthRolBootstrap.jsx` | Persistencia de rol |
| `src/app/router.jsx` | Rutas `/dashboard` y `/empleado` |

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

## 5. Operación en Clerk Dashboard

1. Organizations activas.
2. Usuarios empresa: Create user + Create organization + agregar como **admin**.
3. Empleados: invitación a la Organization (o alta manual + membership como **member**).
4. Desactivar o restringir sign-up público.
5. Paths: Sign-in `/entrar`, Sign-up `/acceso/registro`, After sign-in `/post-login`.
6. Orígenes permitidos: `http://localhost:5173`, `http://localhost:8080` y el dominio de producción.
7. SMTP / entrega de códigos: configurar proveedor de correo en Clerk para que lleguen los OTP.

---

## 6. Cómo probar

1. Empresa con org (admin) → `/entrar` rol Empresa → `/dashboard`.
2. Empleado con membership → `/entrar` rol Empleado → `/empleado` → Mis programas.
3. Usuario sin org + ingreso empresa → `/acceso/sin-empresa` (sin volver a login).
4. Usuario sin org + ingreso empleado → `/acceso/sin-membresia`.
5. Ir a `/sign-up` → `/acceso/registro`.
6. `/dashboard` sin sesión → `/entrar`.
7. Empleado con niveles pendientes: solo ve **Estudiar** hasta completar; luego **Rendir**.
