# Conclusiones

## Hallazgos

- La barrera real para que los datos abiertos se usen no es la
  disponibilidad — es la interpretación. Perfilar, agregar y
  contextualizar automáticamente un dataset crudo, sin instalar nada,
  elimina esa barrera para un funcionario público sin formación
  técnica.
- Un motor determinístico (sin IA) puede cubrir la mayoría del valor
  analítico esperado — clasificación de columnas, KPIs, correlación,
  desviación estándar, detección de atípicos, proyección con rango de
  confianza. La IA aporta más valor **explicando** esos resultados que
  calculándolos.
- Encontramos y corregimos, durante el desarrollo, dos bugs reales que
  habrían sido fáciles de pasar por alto: columnas tipo tasa/porcentaje
  sumándose en vez de promediarse (llegó a producir cifras del orden
  de 10¹⁷ con un dataset real corrupto), y un bucle infinito en la
  exportación a PDF causado por un residuo de punto flotante. Ambos
  quedaron documentados en `tests/` y en `frontend/dashboard/README.md`
  para que no se repitan.

## Limitaciones

- El límite de 50.000 filas por dataset es una decisión de seguridad
  del navegador, no una limitación fundamental — podría subirse, con
  las pruebas de rendimiento correspondientes.
- La proyección usa un único método (tasa de crecimiento promedio),
  por transparencia — no un modelo de series de tiempo (ARIMA) ni de
  machine learning entrenado. Con datasets de pocos periodos (típico
  en cifras municipales anuales), esto es una decisión defendible, no
  una carencia — ver la discusión completa en `docs/roadmap.md`.
- El Narrador Experto depende de un flujo de n8n externo con crédito
  disponible en el proveedor del modelo de lenguaje — si esa pieza
  falla, el chat lo indica con un mensaje claro, pero no responde.
- No hay backend propio: no se guarda historial entre sesiones, ni
  favoritos, ni autenticación de usuarios.
- El DANE no expone una API estructurada como datos.gov.co, así que
  enriquecer las proyecciones con sus boletines recientes requeriría
  una integración adicional (evaluada, no construida — ver
  `docs/roadmap.md`).

## Próximos pasos

Ver la lista priorizada completa en [`roadmap.md`](roadmap.md). Los más
relevantes de cara al concurso:

1. Registro obligatorio en herramientas.datos.gov.co/usos.
2. Poblar `datasets/catalogo.csv` con el inventario real del municipio.
3. Evaluar un botón opcional de regresión lineal para datasets con
   suficiente historia (8+ periodos), como alternativa transparente al
   método actual — diseño ya discutido, pendiente de construir.
4. Explorar enriquecimiento de proyecciones con fuentes externas
   reales (datasets relacionados en datos.gov.co, búsqueda restringida
   a dominios oficiales), siempre citando la fuente, nunca mezclando
   silenciosamente con los datos del usuario.
