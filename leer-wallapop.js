const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
const port = 3000;

// Servir archivos estáticos (para acceder a HTML)
app.use(express.static('public'));

// Endpoint para obtener los productos de Wallapop
app.get('/obtener-precios', async (req, res) => {
    const url = req.query.url;  // La URL de búsqueda de Wallapop se pasa como parámetro

    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle0' });

        // Obtener los precios y enlaces de los productos
        const productos = await page.evaluate(() => {
            const items = document.querySelectorAll('.ItemCard__price');
            const productosData = [];
            items.forEach(item => {
                const precio = item.innerText.trim();
                const enlace = item.closest('a').href;
                productosData.push({ precio, enlace });
            });
            return productosData;
        });

        await browser.close();

        // Enviar los productos como respuesta en formato JSON
        res.json(productos);
    } catch (error) {
        console.error('Error al obtener los datos de Wallapop:', error);
        res.status(500).json({ error: 'Hubo un problema al obtener los datos' });
    }
});

app.listen(port, () => {
    console.log(`Servidor ejecutándose en http://localhost:${port}`);
});
