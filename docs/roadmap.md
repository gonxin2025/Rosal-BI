# Roadmap

## Contexto

Este proyecto se desarrolla para el **Concurso Datos al Ecosistema 2026:
IA para Colombia** (Ministerio TIC). La gran final es en la primera
semana de agosto de 2026, en el marco de GovCamps 2026.

## Completado

- [x] Consola web: búsqueda de datasets en datos.gov.co, carga manual
      (Excel/CSV/URL), análisis automático sin filtros manuales.
- [x] Motor de detección de columnas (categórica/numérica/fecha/ID),
      robusto ante datasets con muchas categorías y filas de resumen.
- [x] Generador de hallazgos en texto (Insight Engine) y clasificación
      automática por categoría del dataset.
- [x] Exportación a PDF y generación de infografía con paleta de colores
      temática según categoría.
- [x] Workflow de n8n con Agente de IA (modelo de chat intercambiable) +
      generación de imagen temática + composición final.
- [x] Verificador de calidad de datos abiertos: 13 de los 22 códigos
      oficiales de error automatizados, con descarga del Excel anotado.
- [x] Soporte para cargar datos por URL (datos federados), incluyendo
      validación de formato abierto.

## En curso / pendiente

- [ ] **Registrar el proyecto en https://herramientas.datos.gov.co/usos**
      — requisito obligatorio de los términos del concurso, no solo
      recomendado. Sin esto, el proyecto no avanza en la evaluación.
- [ ] Conectar el webhook de n8n en producción (reemplazar el
      `WEBHOOK_URL` de ejemplo por la URL real y activa) — crítico antes
      de cualquier demo en vivo ante el jurado.
- [ ] Instalar el microservicio de captura de imagen en el servidor
      definitivo (con proceso persistente vía `pm2` o `systemd`).
- [ ] Poblar `datasets/catalogo.csv` con el inventario real de datasets
      del municipio.
- [ ] Agregar capturas de pantalla reales en `docs/capturas/`,
      `images/mockups/` e `images/banner/` — hoy están vacías.
- [ ] Confirmar que el equipo cumple los requisitos administrativos del
      concurso (mínimo una integrante mujer, perfil de ciencia de
      datos/analítica) — esto no se resuelve en el repositorio.
- [ ] Definir si se necesita backend propio (`backend/`) más allá de
      n8n, o si n8n cubre todas las necesidades de orquestación.
- [ ] Diseñar los dashboards temáticos (`dashboards/`) para cada sector:
      población, economía, movilidad, salud, educación, transparencia,
      indicadores.

## Ideas para después de la entrega

- Modo oscuro en la consola.
- Sidebar con datasets favoritos/recientes.
- Mapas para datasets con coordenadas geográficas.
- Split del frontend en módulos separados si el proyecto crece más allá
  del prototipo.
