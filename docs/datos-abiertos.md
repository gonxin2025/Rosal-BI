# Catálogo de datos abiertos

Este documento describe las fuentes de datos que usa o puede usar Rosal BI.

## Fuente principal: datos.gov.co

La consola busca en vivo dentro del catálogo nacional de datos abiertos,
que corre sobre la plataforma **Socrata**:

- Búsqueda: `https://api.us.socrata.com/api/catalog/v1?domains=datos.gov.co&q=TERMINO`
- Datos de un recurso especifico: `https://www.datos.gov.co/resource/{ID}.json`

Ambos endpoints son públicos y tienen CORS habilitado, por lo que la
consola los consume directo desde el navegador del ciudadano, sin pasar
por un servidor intermedio.

## Datasets propios del municipio

Ver [`../datasets/catalogo.csv`](../datasets/catalogo.csv) para el
inventario completo. Formato de cada fila:

| Columna | Descripción |
|---|---|
| `nombre` | Nombre del dataset |
| `categoria` | Tema (Trámites, Presupuesto, Demografía, etc.) |
| `fuente` | De dónde sale el dato (SUIT, SISBEN, Secretaría de Hacienda...) |
| `ubicacion` | Ruta local en `datasets/` o URL si es federado |
| `frecuencia_actualizacion` | Con qué frecuencia se actualiza |
| `responsable` | Dependencia responsable del dato |

## Antes de publicar cualquier dataset nuevo

Usa `frontend/verificador-calidad/` para revisarlo contra el listado
oficial de errores de calidad de datos.gov.co (ERR001–ERR022) antes de
subirlo — evita el ciclo de espera de 3 a 5 días por un rechazo que se
pudo prevenir.

## Datos personales y anonimización

Cualquier dataset con nombres, cédulas, teléfonos, correos o direcciones
debe anonimizarse antes de publicarse (Ley 1581 de 2012). Ver la
[Guía de Anonimización del Archivo General de la Nación](https://www.archivogeneral.gov.co/sites/default/files/Estructura_Web/5_Consulte/Recursos/Publicacionees/Guia_de_Anonimizacion-min.pdf).
