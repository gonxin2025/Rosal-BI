# Roadmap

## Contexto

Este proyecto se desarrolla para el **Concurso Datos al Ecosistema 2026:
IA para Colombia** (Ministerio TIC). La gran final es en la primera
semana de agosto de 2026, en el marco de GovCamps 2026.

## Completado

- [x] **Lienzo Ejecutivo** (reemplazó la consola original): perfilado
      heurístico de columnas, plan de panel revisable con checkboxes,
      tabla de proyección estadística, exportación a PDF multipágina.
      Ya en producción en rosal-bi.netlify.app.
- [x] Bug real corregido: bucle infinito en la exportación a PDF cuando
      la altura del lienzo caía cerca de un múltiplo exacto de página.
- [x] Metadatos reales del dataset (vistas, descargas, entidad, fechas)
      desde la API de Socrata, no solo la muestra de datos.
- [x] Verificador de calidad de datos abiertos: 13 de los 22 códigos
      oficiales de error automatizados, con descarga del Excel anotado.
- [x] Soporte para cargar datos por URL (datos federados), incluyendo
      validación de formato abierto.
- [x] Presentación para el jurado (`presentacion/`).
- [x] Identidad visual real de Rosal BI (logo, favicon, banner).

## En curso / pendiente

- [ ] **Registrar el proyecto en https://herramientas.datos.gov.co/usos**
      — requisito obligatorio de los términos del concurso, no solo
      recomendado. Sin esto, el proyecto no avanza en la evaluación.
- [ ] Poblar `datasets/catalogo.csv` con el inventario real de datasets
      del municipio.
- [ ] Agregar capturas de pantalla reales del dashboard en
      `docs/capturas/` e `images/mockups/`.
- [ ] Confirmar que el equipo cumple los requisitos administrativos del
      concurso (mínimo una integrante mujer, perfil de ciencia de
      datos/analítica) — esto no se resuelve en el repositorio.
- [ ] Definir si se necesita backend propio (`backend/`) más allá del
      frontend actual.
- [ ] Diseñar los dashboards temáticos (`dashboards/`) para cada sector:
      población, economía, movilidad, salud, educación, transparencia,
      indicadores.

## Ideas para después de la entrega

- Modo oscuro en la consola.
- Sidebar con datasets favoritos/recientes.
- Mapas para datasets con coordenadas geográficas.
- Split del frontend en módulos separados si el proyecto crece más allá
  del prototipo.
