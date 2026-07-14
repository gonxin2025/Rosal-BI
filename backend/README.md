# Backend (estructura preparada, sin desarrollar aún)

Por ahora, toda la orquestación de IA vive en `ai/n8n/` (un workflow de
n8n) y toda la logica de analisis vive directo en el frontend
(`frontend/dashboard/index.html`). No hay un backend propio corriendo
todavia.

Esta carpeta queda preparada por si el proyecto necesita, mas adelante,
un servicio propio (por ejemplo, para no depender de que el navegador
del ciudadano llame directo a datos.gov.co, o para agregar
autenticacion). Estructura sugerida:

- `api/` — endpoints HTTP expuestos por el backend.
- `services/` — logica de negocio (ej. analisis de datasets si se migra
  del frontend al servidor).
- `models/` — definiciones de datos/esquemas.
- `routes/` — definicion de rutas, si se usa un framework tipo
  Express/FastAPI.
- `config/` — configuracion por ambiente (dev/prod).

Si decides implementarlo, documenta aqui el stack elegido (Node/Express,
Python/FastAPI, etc.) y actualiza `docs/arquitectura.md`.
