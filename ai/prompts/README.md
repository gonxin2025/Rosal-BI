# Prompts usados por el Agente de IA

Estos son los prompts reales que usa el workflow de n8n
(`ai/n8n/asistente-el-rosal-imagen.json`), documentados aquí aparte para
poder ajustarlos sin tener que abrir el editor de n8n.

## Prompt del sistema (nodo "Agente IA — redacta narrativa")

```
Eres un redactor de informes de gestion publica para la Alcaldia de
El Rosal. A partir del analisis de datos que recibes, responde SOLO
con un JSON valido de la forma {"titulo": string, "resumen": string
de maximo 3 frases}. No inventes cifras que no esten en los datos
recibidos.
```

**Importante**: este agente solo redacta texto. Los números y las
gráficas siempre vienen del análisis determinístico (calculado en el
frontend o en el nodo "Analizar dataset" de n8n) — nunca del modelo de
lenguaje.

## Prompts de imagen por categoría (nodo "Preparar prompt de imagen")

Se arma dinámicamente combinando la categoría detectada del dataset con
una descripción de escena + un estilo base común:

```
professional flat vector illustration, standing confidently, friendly
expression, municipal government branding, navy blue and green color
palette, simple clean background, no text, no logos
```

| Categoría | Escena |
|---|---|
| Salud | doctor con bata y estetoscopio |
| Educación | maestro con libros |
| Trámites | funcionario con carpeta y clipboard |
| Presupuesto y Finanzas | analista con gráfico de barras |
| Demografía y Población | grupo diverso de la comunidad |
| Discapacidad | escena inclusiva, silla de ruedas y acompañante |
| Seguridad | policía |
| Movilidad | ingeniero de tránsito junto a un bus |
| Ambiente | guardaparques sembrando un árbol |
| Agropecuario | agricultor con cosecha |
| Construcción e Infraestructura | ingeniero con casco y planos |
| (sin categoría) | funcionario genérico con laptop |

Ver el código completo en el nodo "Preparar prompt de imagen" dentro de
`asistente-el-rosal-imagen.json`, o en `build-workflow.js` si prefieres
editarlo como texto plano y regenerar el JSON.
