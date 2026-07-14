# Contribuir a Rosal BI

Gracias por tu interés en aportar a este proyecto.

## Cómo reportar un problema

Abre un [Issue](../../issues) describiendo:
- Qué esperabas que pasara.
- Qué pasó en realidad.
- Pasos para reproducirlo (idealmente con un dataset de ejemplo, sin datos personales reales).

## Cómo proponer un cambio

1. Crea una rama a partir de `main`: `git checkout -b nombre-descriptivo`.
2. Haz tus cambios. Si tocas `frontend/dashboard/index.html` o
   `frontend/verificador-calidad/index.html`, prueba abriendo el archivo
   directo en el navegador antes de subir el cambio.
3. Actualiza `CHANGELOG.md` con una línea breve describiendo el cambio.
4. Abre un Pull Request describiendo el motivo del cambio.

## Buenas prácticas específicas de este proyecto

- **Nunca subas datos con información personal real** (nombres, cédulas,
  teléfonos, direcciones) a `datasets/originales/` — usa el
  `frontend/verificador-calidad/` para detectar esto antes de subir nada.
- Las credenciales de APIs (OpenAI, Anthropic) **nunca van en el código**
  — se configuran como credenciales dentro de n8n, no en este repositorio.
- Si agregas un dashboard nuevo en `dashboards/`, sigue la misma
  estructura de carpeta por tema que ya existe (`poblacion/`,
  `salud/`, etc.).

## Código de conducta

Se espera un trato respetuoso y constructivo en issues, pull requests y
cualquier discusión relacionada con el proyecto.
