# Roadmap

## Contexto

Este proyecto se desarrolla para el **Concurso Datos al Ecosistema 2026:
IA para Colombia** (Ministerio TIC). La gran final es en la primera
semana de agosto de 2026, en el marco de GovCamps 2026.

## Completado

- [x] **Rosal BI dashboard**: perfilado heurístico de columnas, plan de
      panel revisable con checkboxes, exportación a PDF multipágina.
      Ya en producción en rosal-bi.netlify.app, con identidad visual
      real (logo, favicon, banner) y diseño responsive (tablet/celular).
- [x] Bug real corregido: bucle infinito en la exportación a PDF cuando
      la altura del lienzo caía cerca de un múltiplo exacto de página
      (se repitió más de una vez al regenerar el archivo — documentado
      en `frontend/dashboard/README.md` para que no vuelva a pasar).
- [x] Bug real corregido: columnas tipo tasa/porcentaje se sumaban en
      vez de promediarse, amplificando valores corruptos del dataset
      de origen hasta cifras absurdas — ahora se detectan por nombre y
      se promedian, con rechazo de outliers de formato.
- [x] Motor estadístico real: desviación estándar, correlación entre
      variables, detección de valores atípicos — probado con 10.000
      filas en menos de 100ms sin bloquear la interfaz.
- [x] Proyecciones con rango de confianza (no un número único fingiendo
      precisión que los datos no tienen).
- [x] Comparador de pares (entidad específica vs. grupo de pares).
- [x] Referencias externas: resumen de Wikipedia + datasets
      relacionados de datos.gov.co, asíncronas y no-bloqueantes (si
      falla internet, simplemente no aparecen, no rompen nada).
- [x] Chat con IA real ("Narrador Experto") vía n8n, con memoria de
      conversación por sesión y acceso a la lista completa de cada
      gráfica (no solo un "top 5") para responder sobre cualquier
      categoría, incluyendo las menos destacadas.
- [x] Metadatos reales del dataset (vistas, descargas, entidad, fechas)
      desde la API de Socrata, no solo la muestra de datos.
- [x] Verificador de calidad de datos abiertos: 13 de los 22 códigos
      oficiales de error automatizados, con descarga del Excel anotado.
- [x] Soporte para cargar datos por URL (datos federados), incluyendo
      validación de formato abierto.
- [x] Presentación para el jurado (`presentacion/`), con la identidad
      visual real integrada en las 10 diapositivas.
- [x] Pestaña "❓ Ayuda" dentro de la app: manual de uso, APIs y
      variantes de análisis documentadas, explicación del modelo
      predictivo, sobre nosotros, preguntas frecuentes, y enlace al
      repositorio.
- [x] Nota de transparencia sobre el método de proyección, visible
      directamente en la pestaña de Análisis IA cuando aparece una
      proyección.
- [x] **Registro del proyecto en herramientas.datos.gov.co/usos** —
      completado.
- [x] **Equipo confirmado**: Luzaira Henao (Jefa de TICs, líder del
      equipo), e ingenieros Luis Sandoval, Kevin Ramírez e Iván
      Bermúdez.
- [x] Bug real corregido: la exportación a PDF cortaba gráficas y
      tablas a la mitad cuando el corte de página caía en medio de una
      tarjeta. Ahora el corte se ajusta automáticamente al inicio de la
      siguiente tarjeta — ver `tests/` y `frontend/dashboard/README.md`.
- [x] Botón de regresión lineal para proyecciones: aparece solo cuando
      hay 8 o más periodos históricos válidos (criterio de
      elegibilidad), como alternativa transparente al método por
      defecto (tasa de crecimiento promedio) — el usuario elige cuál
      ver, nunca lo decide una IA. Documentado en
      `docs/data_dictionary.md` y en la pestaña de Ayuda de la app.

## En curso / pendiente

- [ ] Evaluar herramientas para enriquecer las proyecciones con
      información externa reciente (búsqueda restringida a dominios
      oficiales tipo Tavily, o extender la búsqueda de datasets
      relacionados) — solo para el párrafo de proyección/estimado,
      nunca para reinterpretar lo que ya está graficado. El DANE no
      tiene una API estructurada como datos.gov.co, así que esto
      requiere diseño cuidadoso antes de construirlo. Sigue en
      evaluación, sin decisión de construcción todavía.
- [ ] Poblar `datasets/catalogo.csv` con el inventario real de datasets
      del municipio.
- [ ] Agregar capturas de pantalla reales del dashboard en
      `docs/capturas/` e `images/mockups/`.
- [ ] Definir si se necesita backend propio (`backend/`) más allá del
      frontend actual y del webhook de n8n.
- [ ] Diseñar los dashboards temáticos (`dashboards/`) para cada sector:
      población, economía, movilidad, salud, educación, transparencia,
      indicadores.

## Ideas para después de la entrega

- Sidebar con datasets favoritos/recientes.
- Mapas para datasets con coordenadas geográficas.
- Split del frontend en módulos separados si el proyecto crece más allá
  del prototipo.
