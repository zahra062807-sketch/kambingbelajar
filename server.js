// ══════════════════════════════════════════
//   BelajarBareng.id — Backend Server
//   Menyimpan API key dengan aman & jadi
//   perantara (proxy) ke Google Gemini API
//   (GRATIS — 1.500 request/hari, tanpa kartu kredit)
// ══════════════════════════════════════════

require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;
const MODEL = 'gemini-2.5-flash';

if (!API_KEY) {
  console.error('❌ GEMINI_API_KEY tidak ditemukan di file .env');
  console.error('   Buat file .env dan isi: GEMINI_API_KEY=xxxxxxxxxxxxxxxx');
  process.exit(1);
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname)); // supaya index.html & tutor.html bisa dibuka dari server ini juga

// Endpoint yang dipanggil frontend (tutor.html)
app.post('/api/chat', async (req, res) => {
  const { system, messages } = req.body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages kosong atau tidak valid' });
  }

  // Ubah format history (Anthropic-style) ke format Gemini
  const contents = messages.map(m => ({
    role: m.role === 'assistant' ? 'model' : 'user',
    parts: [{ text: m.content }],
  }));

  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents,
        systemInstruction: {
          parts: [{ text: system || 'Kamu adalah tutor yang ramah dan membantu.' }],
        },
        generationConfig: { maxOutputTokens: 1000 },
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Gemini API error:', data);
      return res.status(response.status).json({ error: data.error?.message || 'Terjadi kesalahan pada API' });
    }

    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Maaf, terjadi kesalahan. Coba lagi ya!';

    // Kirim balik dalam format yang sudah dipahami frontend
    res.json({ content: [{ text }] });
  } catch (err) {
    console.error('Server error:', err);
    res.status(500).json({ error: 'Gagal terhubung ke Gemini API' });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server jalan di http://127.0.0.1:${PORT}`);
  console.log(`   Buka http://127.0.0.1:${PORT}/index.html di browser`);
});
