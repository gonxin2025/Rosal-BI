# Flujo de n8n — Chat "Narrador Experto" (Rosal BI)

Responde preguntas del chat de Rosal BI directo con las cifras reales
de la tabla completa (no solo lo que se ve graficado) — sin que la IA
calcule ni invente una sola cifra, y sin abrir con un párrafo de
contexto general que no fue lo que se preguntó.

## Cómo funciona

```
Chat de Rosal BI (pregunta del usuario)
        │  la app YA calculó: KPIs, LISTA COMPLETA de cada categoría en
        │  cada gráfica/columna (hasta 500 por columna), media/desviación/
        │  correlación/atípicos/proyección — nunca manda el dataset crudo
        │  fila por fila, pero sí cubre todas las categorías, no un top 5
        ▼
  Webhook (n8n)
        │
        ▼
  Preparar contexto para el Narrador (Code)
        │  convierte esos numeros en un resumen de texto legible
        ▼
  Narrador Experto (Agente IA + modelo de chat intercambiable)
        │  responde DIRECTO con las cifras exactas que pidieron,
        │  buscándolas en las listas completas — sin preámbulo
        │  institucional salvo que el usuario lo pida explícitamente
        ▼
  Responder al webhook → { respuesta: "..." }
        │
        ▼
  El chat muestra la respuesta
```

**Nota sobre las gráficas del panel**: esto es aparte del límite de
gráficas que ya tenías (10 categorías por gráfica, para que se sigan
viendo bien) — ese límite sigue igual, no cambió. Lo que cambió es
solo lo que el chat manda por detrás al Narrador, que es invisible
para el usuario.

## Memoria de la conversación

Solo el primer mensaje de cada dataset cargado manda el contexto
completo (KPIs, listas, estadísticas) — los mensajes siguientes de esa
misma conversación solo mandan la pregunta, y el Agente recuerda el
contexto anterior gracias al nodo "Memoria de la conversación"
(identificado por un `sessionId` que la app genera una vez por
dataset). Al cargar un dataset nuevo se abre una sesión nueva.

## Cuándo se activa

El chat primero intenta responder con patrones locales instantáneos
("top 10 de X", "promedio de Y") — gratis, sin llamar a nada externo.
Solo cuando esos patrones no reconocen la pregunta (algo más abierto,
como pedir contexto o una comparación cualitativa), se escala al
Narrador Experto. Esto mantiene el costo bajo: no cada mensaje del chat
genera una llamada al modelo.

## Regla que nunca se rompe

El Agente recibe SOLO los números que la app ya calculó (nunca el
dataset completo) y tiene instrucción explícita de citar solo esas
cifras — si la pregunta necesita un dato que no está en el contexto,
debe decirlo en vez de inventarlo. Puede usar su conocimiento general
sobre instituciones colombianas (qué hace el DANE, cómo opera el SGP,
qué es el PAE) como contexto cualitativo, nunca para inventar una cifra
específica.

## Instalación

1. Importa `rosal-bi-chat-narrador.json` en tu n8n.
2. Asigna una credencial de OpenAI (o cambia el nodo "Modelo de Chat" por
   Gemini/Anthropic) al nodo "Modelo de Chat (OpenAI)".
3. Activa el workflow y copia la Production URL del nodo Webhook.
4. En el HTML de Rosal BI, reemplaza:
   ```js
   const CHAT_WEBHOOK_URL = "https://tu-instancia-n8n.app/webhook/chat-narrador";
   ```
   por tu URL real.

## Verificado

- El nodo "Preparar contexto para el Narrador" se probó con datos de
  ejemplo realistas (KPIs, gráficas, estadísticas, pregunta) — genera un
  resumen de texto correcto y completo.
- El lado de la app (`buildChatContext`) se probó con un dataset real
  cargado en el navegador: arma correctamente los KPIs y el top 5 de
  cada gráfica seleccionada con números reales.
- Se probó el manejo de error cuando el webhook no está configurado: el
  chat muestra un mensaje claro ("No se pudo conectar con el Narrador
  Experto...") en vez de fallar en silencio o quedarse colgado en
  "pensando".
