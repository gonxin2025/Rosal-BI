# Dashboards temáticos

Rosal BI ya funciona con **cualquier** dataset de datos.gov.co o
archivo local — no hay un "motor de análisis de salud" distinto de un
"motor de análisis de educación". Por eso, un "dashboard temático" no
es una aplicación separada: es una **combinación específica de
dataset + KPIs + gráficos** para ese sector, que cualquiera puede abrir
hoy mismo en `frontend/dashboard/` sin escribir código.

Cada subcarpeta documenta, por sector, qué dataset real buscar y qué
KPIs tienen sentido — es una **especificación**, no una carpeta vacía
ni una aplicación aparte. Usarla hoy es tan simple como: abrir Rosal
BI, buscar el dataset sugerido, y dejar que el sistema proponga el
resto.

## Cómo se prioriza una futura versión "guardada" de cada uno

Hoy el usuario tiene que buscar el dataset cada vez. Un paso natural a
futuro (ver `docs/roadmap.md`) sería que la app pudiera "recordar" una
combinación dataset + KPIs + gráficos ya elegida antes, para abrirla
con un clic — eso sí requeriría una pequeña capa de almacenamiento que
hoy no existe (Rosal BI no tiene backend propio, ver
`docs/arquitectura.md`).
