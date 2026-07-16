# Imagen oficial de Puppeteer: ya trae Chromium y todas las librerias
# del sistema que necesita para correr -- evita el problema mas comun
# al desplegar Puppeteer en un PaaS (Chromium no arranca por faltar
# dependencias del sistema).
FROM ghcr.io/puppeteer/puppeteer:22.0.0

WORKDIR /app

# La imagen base ya trae un usuario no-root llamado "pptruser".
COPY --chown=pptruser:pptruser package.json ./
RUN npm install --omit=dev

COPY --chown=pptruser:pptruser server.js ./

ENV PORT=4000
EXPOSE 4000

CMD ["node", "server.js"]
