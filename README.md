# Inducta CHILE

Proyecto de título. La app vive en `inducta-chile`.

## Requisitos

- [Node.js](https://nodejs.org/) 20 o superior (incluye `npm`)
- Las dependencias están listadas en [`requirements.txt`](requirements.txt) y se instalan con npm desde `inducta-chile/package.json`.

## Instalar requirements

```bash
npm install --prefix inducta-chile
```

Eso lee `inducta-chile/package.json` e instala todo lo de `requirements.txt`. No uses `pip`.

Copia `inducta-chile/.env.local` (Clerk y Supabase). Ese archivo no se sube a GitHub.

## Arrancar

Desde la raíz del repo:

```bash
npm run dev
```

Queda en http://localhost:5173/
