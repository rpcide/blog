# AGENTS.md

Guía para agentes de IA (y personas) que trabajan en este repositorio.

## Proyecto

**RPCIDE Blog**: blog de RPCIDE construido con **Astro 4** en modo SSR (`output: "server"`), desplegado en **Vercel** (`@astrojs/vercel/serverless`). Los artículos se guardan en **MongoDB Atlas** y el contenido se escribe en Markdown (renderizado con `marked`). La interfaz pública está en español.

## Comandos

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo en http://localhost:4321
npm run build      # build de producción (salida para Vercel)
npm run preview    # previsualizar el build
npm run astro -- check   # chequeo de tipos/diagnósticos de Astro
```

No hay suite de tests ni linter configurados. Para validar cambios, ejecuta `npm run build`.

## Variables de entorno

Copia `.env.example` a `.env`. Todas son obligatorias:

| Variable           | Uso                                                                 |
| ------------------ | ------------------------------------------------------------------- |
| `MONGODB_NAME`     | Nombre de la base de datos                                          |
| `MONGODB_USER`     | Usuario de MongoDB Atlas                                            |
| `MONGODB_PASSWORD` | Contraseña de MongoDB Atlas                                         |
| `API_USERS_URL`    | API de usuarios (datos del autor: `GET {API_USERS_URL}/user/:id`)   |
| `API_RPCIDE_URL`   | API de RPCIDE para validar tokens (`GET {API_RPCIDE_URL}/auth`)     |
| `APP_RPCIDE_URL`   | URL de la app RPCIDE (enlaces desde el blog)                        |

`src/lib/mongodb.js` lanza un error al importarse si faltan las variables de MongoDB, así que cualquier página o endpoint que importe `src/lib/Posts.js` necesita la base de datos. Nunca hagas commit de `.env` ni de credenciales.

## Estructura

```
src/
  config/index.js     # PAGE_LIMIT (10) y URLs leídas de import.meta.env
  lib/
    mongodb.js        # conexión a MongoDB (cacheada en global en desarrollo)
    Posts.js          # acceso a datos de la colección "posts" (CRUD, paginación, búsqueda)
    user.js           # verifyToken(): valida el Bearer token contra API_RPCIDE_URL
  pages/
    index.astro               # portada: últimos posts + "cargar más"
    articulo/[slug].astro     # detalle de artículo (Markdown -> HTML, fecha con dayjs en "es")
    busqueda/index.astro      # resultados por ?s=<texto> o ?tag=<tag>
    api/
      posts.js        # GET (paginado), POST/PUT/DELETE (requieren token)
      postById.js     # GET ?id=
      postsByUser.js  # GET ?authorId=&page=
      searchPosts.js  # GET ?s=&tags=&page=
  components/         # componentes .astro (Header, Footer, Post, Pagination, ...)
  layouts/Layout.astro
  types/colors.js     # variantes de color (clases Tailwind) para componentes
```

## Modelo de datos (colección `posts`)

Campos usados: `_id`, `title`, `slug`, `content` (Markdown), `tags` (array), `authorId`, `createdAt`, `updatedAt`.

- Las funciones de listado devuelven `{ page, posts, count, hasNext }` y añaden `id` (copia de `_id`) a cada post.
- `createPost` genera el `slug` desde el título (minúsculas, espacios → `-`) y añade un sufijo `uniqid()` si ya existe.
- `updatePost` y `removePost` filtran por `_id` **y** `authorId`: un autor solo puede modificar sus propios posts.

## API

- Los endpoints de escritura (`POST`, `PUT`, `DELETE` en `/api/posts`) reciben JSON con `token` (y `data` o `id`/`authorId`) y validan con `verifyToken`; si la respuesta trae `error`, devuelven 401.
- Las respuestas se construyen con `new Response(JSON.stringify(...), { status })`. Mantén ese estilo y los códigos de estado existentes al añadir endpoints.
- La paginación del frontend ("cargar más") llama a estos endpoints desde scripts inline con `define:vars`.

## Convenciones

- JavaScript (ES modules), no TypeScript, salvo `env.d.ts`. `tsconfig` extiende `astro/tsconfigs/base`.
- Indentación de 2 espacios, LF, UTF-8 (`.editorconfig`). Comillas dobles y punto y coma.
- Estilos con **Tailwind CSS 3**; usa los tokens de `tailwind.config.mjs` (`primary-*`, `bg-base`, `bg-alt`, `bg-dark`, `border`, `text`, `textAlt`, fuentes `font-heading` / `font-body`) en vez de colores sueltos. Tema oscuro.
- Textos visibles para el usuario en español; nombres de código y comentarios en inglés.
- Rutas públicas en español (`/articulo/...`, `/busqueda`).
- Fechas con `dayjs` y locale `es`.
- Versiones de dependencias fijadas en `package.json`: no las actualices salvo que se pida.

## Notas para agentes

- Haz cambios pequeños y enfocados; no reestructures carpetas sin necesidad.
- Antes de terminar, ejecuta `npm run build` si tienes las variables de entorno; si no, indícalo.
- No expongas datos de conexión (el host del cluster está en `src/lib/mongodb.js`); no añadas secretos al código.
