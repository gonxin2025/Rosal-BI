# Asistentes (configuracion de modelos)

Referencia rapida de que modelo de chat esta conectado al Agente de IA
del workflow de n8n (nodo "Agente IA -- redacta narrativa").

Por defecto el workflow trae un nodo "Modelo de Chat (OpenAI)" usando
`gpt-4o-mini`. Para cambiar de proveedor:

1. Borra ese nodo en n8n.
2. Agrega el nodo equivalente ("Google Gemini Chat Model", "Anthropic
   Chat Model", etc.).
3. Conectalo al mismo puerto `ai_languageModel` del nodo Agente.
4. Asigna su credencial nativa de ese proveedor.

Documenta aqui cual quedo conectado en cada momento, para que el equipo
sepa que credencial mantener activa.
