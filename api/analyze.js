export default async function handler(req, res) {

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { data } = req.body;

  if (!data) {
    return res.status(400).json({ error: 'No data provided' });
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: `Você é um analista de trading profissional. Analise esses dados de mercado e forneça uma análise concisa em português do Brasil.

Dados do mercado:
- Ativo: ${data.sym}
- Timeframe: ${data.tfK}
- Sinal: ${data.dir}
- Score da IA: ${data.score}/100 (${data.forca})
- RSI: ${data.rsi}
- MACD: ${data.macdBull ? 'Bullish' : 'Bearish'}
- EMA Stack: ${data.emaBull ? 'Bullish alinhada' : data.emaBear ? 'Bearish alinhada' : 'Mista/neutra'}
- Stochastic: ${data.stK}%
- Acima do VWAP: ${data.aboveVwap ? 'Sim' : 'Não'}
- Bollinger Bands: ${data.bbPos}
- Confluências: ${data.confOn}/${data.confTotal} estratégias confirmadas
- Tendência: ${data.trendLabel} (força: ${Math.round(data.trendStr)}%)
- Preço atual: ${data.price}
- Zona de entrada: ${data.zona}
- Stop Loss: ${data.invalid}
- Take Profit: ${data.alvo}
- RR: 1:${data.rr}

Responda em 4 frases curtas e diretas:
1. Avaliação geral do setup
2. Ponto mais forte deste sinal
3. Principal risco a observar
4. Nível chave a monitorar

Seja profissional, conciso e objetivo. Não use markdown.`
        }]
      })
    });

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err.error?.message || 'Claude API error' });
    }

    const result = await response.json();
    return res.status(200).json({
      analysis: result.content[0].text
    });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
