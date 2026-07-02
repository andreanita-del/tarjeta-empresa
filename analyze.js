module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  try {
    const { contentBlock } = req.body || {};
    if (!contentBlock) {
      res.status(400).json({ error: 'Falta contentBlock' });
      return;
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'ANTHROPIC_API_KEY no configurada en el servidor' });
      return;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-6',
        max_tokens: 400,
        messages: [{
          role: 'user',
          content: [
            contentBlock,
            {
              type: 'text',
              text: 'Analiza este ticket/factura y responde SOLO con JSON valido: {"fecha":"YYYY-MM-DD","proveedor":"nombre del establecimiento","lugar":"ciudad","importe":0.00,"categoria":"comidas|vuelos|trenes|alquiler|hoteles|material|parking|gasoil|peajes|otro","nota":"si ves nombre de persona o pasajero escribe por ej: Coche Philippe, Hotel Julien, Vuelo Pierre. Si no hay persona deja string vacio"}. Sin texto extra, solo JSON.'
            }
          ]
        }]
      })
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
