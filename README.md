<p align="center">
  <img src="assets/logo-oficial.png" alt="Inducta Chile" width="260">
</p>

<h1 align="center">Inducta Chile</h1>

<p align="center">
  <strong>Plataforma SaaS de inducción y capacitación corporativa</strong><br>
  Proyecto de Título · Ingeniería en Informática · Duoc UC — San Joaquín
</p>

<p align="center">
  <a href="https://github.com/Poison-CL/proyecto-titulo-inducta"><img alt="Repositorio" src="https://img.shields.io/badge/GitHub-Poison--CL%2Fproyecto--titulo--inducta-181717?style=for-the-badge&logo=github&logoColor=white"></a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-19-20232A?style=flat-square&logo=react&logoColor=61DAFB">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-8-646CFF?style=flat-square&logo=vite&logoColor=white">
  <img alt="Supabase" src="https://img.shields.io/badge/Supabase-Postgres-3FCF8E?style=flat-square&logo=supabase&logoColor=white">
  <img alt="Clerk" src="https://img.shields.io/badge/Clerk-Auth-6C47FF?style=flat-square&logo=clerk&logoColor=white">
  <img alt="Transbank" src="https://img.shields.io/badge/Transbank-Webpay-E30613?style=flat-square">
  <img alt="Podman" src="https://img.shields.io/badge/Podman-Compose-892CA0?style=flat-square&logo=podman&logoColor=white">
</p>

<p align="center">
  <a href="#sobre-el-proyecto">Proyecto</a> ·
  <a href="#equipo">Equipo</a> ·
  <a href="#stack-tecnológico">Stack</a> ·
  <a href="#estructura-del-repositorio">Estructura</a> ·
  <a href="#inicio-rápido">Inicio rápido</a> ·
  <a href="#arquitectura">Arquitectura</a> ·
  <a href="#documentación">Documentación</a>
</p>

---

## Sobre el proyecto

**Inducta Chile** es una plataforma **SaaS multi-tenant** orientada a digitalizar el onboarding y la capacitación del personal en empresas de Chile.

La solución permite centralizar programas de inducción, registrar el avance de cada colaborador, emitir certificados en PDF como evidencia para auditorías y gestionar planes comerciales con pago vía Transbank (precios en UF). El acceso se separa entre perfiles de **empresa (admin)** y **trabajador**.

| Objetivo | Descripción |
|---|---|
| Ordenar | Inducciones y capacitaciones por cargo, área o normativa |
| Trazar | Quién completó cada etapa y en qué fecha |
| Evidenciar | Certificados listos para auditoría |
| Monetizar | Suscripciones B2B con pasarela de pago |

---

## Equipo

<table>
  <tr>
    <td width="50%" align="center" valign="top">
      <a href="https://github.com/Poison-CL">
        <img src="https://avatars.githubusercontent.com/u/262444070?v=4" width="120" height="120" style="border-radius:50%;" alt="Mateo Martínez Gijón">
      </a>
      <br><br>
      <strong><a href="https://github.com/Poison-CL">Mateo Martínez Gijón</a></strong>
      <br>
      <sub>@Poison-CL</sub>
      <br><br>
      Fullstack
      <br>
      <br><br>
      <a href="https://github.com/Poison-CL"><img src="https://img.shields.io/badge/GitHub-Poison--CL-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub Mateo"></a>
      <a href="https://mateo-dev-seven.vercel.app/"><img src="https://img.shields.io/badge/Portfolio-Web-0B6E4F?style=flat-square" alt="Portfolio Mateo"></a>
    </td>
    <td width="50%" align="center" valign="top">
      <a href="https://github.com/haelfert-ux">
        <img src="https://avatars.githubusercontent.com/u/315952480?v=4" width="120" height="120" style="border-radius:50%;" alt="Hans Elfert">
      </a>
      <br><br>
      <strong><a href="https://github.com/haelfert-ux">Hans Elfert</a></strong>
      <br>
      <sub>@haelfert-ux</sub>
      <br><br>
      Fullstack
      <br>
      <br><br>
      <a href="https://github.com/haelfert-ux"><img src="https://img.shields.io/badge/GitHub-haelfert--ux-181717?style=flat-square&logo=github&logoColor=white" alt="GitHub Hans"></a>
    </td>
  </tr>
</table>

<p align="center">
  <sub>
    <strong>Institución:</strong> Duoc UC — Sede San Joaquín<br>
    <strong>Carrera:</strong> Ingeniería en Informática<br>
    <strong>Asignatura:</strong> Capstone / Portafolio de Título (PTY4614)
  </sub>
</p>

---

## Stack tecnológico

| Capa | Tecnología |
|---|---|
| Frontend | React 19, Vite, Chakra UI, React Router |
| Autenticación | Clerk (organizaciones y roles) |
| Datos | Supabase (PostgreSQL, RLS, Storage, Edge Functions) |
| Pagos | Transbank Webpay Plus |
| Contenedor | Podman + Compose |

---

## Estructura del repositorio

```text
proyecto-titulo-inducta/
├── assets/                        # Logo y diagramas del README
├── Desarrollo de Documentacion/   # Guías técnicas y requisitos
├── Desarrollo_Proyecto/           # Código de la aplicación
│   ├── inducta-chile/             # App web + Supabase + Podman
│   └── package.json               # Scripts npm del proyecto
├── FASE 1/                        # Evidencias académicas
│   ├── Evidencias grupales/
│   └── Evidencias Individuales/
└── README.md
```

Documentación técnica de la app:  
[Desarrollo_Proyecto/inducta-chile/README.md](Desarrollo_Proyecto/inducta-chile/README.md)

---

## Inicio rápido

### Requisitos

- Node.js 20 o superior
- Cuentas de [Clerk](https://dashboard.clerk.com) y [Supabase](https://supabase.com/dashboard)
- Opcional: [Podman Desktop](https://podman-desktop.io/) y `podman-compose`

Detalle: [Desarrollo de Documentacion/requirements.txt](Desarrollo%20de%20Documentacion/requirements.txt)

### Instalación

```bash
cd Desarrollo_Proyecto
npm install --prefix inducta-chile
```

```powershell
copy inducta-chile\.env.example inducta-chile\.env
```

Completa en `.env` las claves de Clerk y Supabase.

### Desarrollo local

```bash
npm run dev --prefix inducta-chile
```

Aplicación en [http://localhost:5173/](http://localhost:5173/)

### Contenedor (Podman)

```powershell
cd inducta-chile
podman compose up --build
```

Aplicación en [http://localhost:8080/](http://localhost:8080/)

---

## Arquitectura

<p align="center">
  <img src="assets/diagrams/arquitectura-inducta.png" alt="Arquitectura Inducta Chile" width="900">
</p>

<p align="center">
  <sub>Modelo de datos actual</sub><br>
  <img src="assets/diagrams/modelo-datos-inducta.png" alt="Modelo de datos Inducta Chile" width="900">
</p>

---

## Documentación

| Documento | Contenido |
|---|---|
| [README de la app](Desarrollo_Proyecto/inducta-chile/README.md) | Setup, estructura de `src/` y comandos |
| [Instalación Podman](Desarrollo%20de%20Documentacion/INSTALACION-PODMAN.md) | Contenedor paso a paso |
| [Clerk Empresa / Empleado](Desarrollo%20de%20Documentacion/CLERK-EMPRESA-EMPLEADO.md) | Roles y organizaciones |

---

## Repositorio

| Recurso | Enlace |
|---|---|
| Código fuente | [github.com/Poison-CL/proyecto-titulo-inducta](https://github.com/Poison-CL/proyecto-titulo-inducta) |
| Contribuciones | [@Poison-CL](https://github.com/Poison-CL) · [@haelfert-ux](https://github.com/haelfert-ux) |

---

## Licencia y uso

© 2026 Mateo Martínez Gijón y Hans Elfert.
Todos los derechos reservados.
Uso exclusivo académico del equipo del Proyecto de Título.
Prohibida la copia, distribución o uso comercial sin autorización escrita de los autores.****
