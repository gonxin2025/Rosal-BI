const express = require("express");
const puppeteer = require("puppeteer");

const app = express();
app.use(express.json({ limit: "20mb" }));

let browserPromise = null;
function getBrowser() {
  if (!browserPromise) {
    browserPromise = puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });
  }
  return browserPromise;
}

app.get("/health", (req, res) => res.json({ ok: true }));

app.post("/render", async (req, res) => {
  const { html, width } = req.body || {};
  if (!html) return res.status(400).json({ error: "falta 'html' en el body" });

  let page;
  try {
    const browser = await getBrowser();
    page = await browser.newPage();
    await page.setViewport({ width: Number(width) || 900, height: 800, deviceScaleFactor: 2 });
    await page.setContent(
      `<!DOCTYPE html><html><head><meta charset="UTF-8"></head><body style="margin:0">${html}</body></html>`,
      { waitUntil: "networkidle0", timeout: 20000 }
    );
    const el = await page.$("body > *");
    const buffer = await (el || page).screenshot({ type: "png" });
    res.set("Content-Type", "image/png");
    res.send(buffer);
  } catch (err) {
    console.error("Error al renderizar:", err);
    res.status(500).json({ error: err.message });
  } finally {
    if (page) await page.close().catch(() => {});
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log("html-image-service escuchando en el puerto " + PORT));
