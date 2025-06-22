const express = require('express');
const axios = require('axios');
const https = require('https');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();
const app = express();
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN;
const TELEGRAM_API = `https://api.telegram.org/bot${BOT_TOKEN}`;
const TELEGRAM_FILE_API = `https://api.telegram.org/file/bot${BOT_TOKEN}`;

// Endpoint for Telegram webhook (POST)
app.post('/webhook', async (req, res) => {
  const message = req.body.message;
  if (!message || !message.video) return res.sendStatus(200);

  const fileId = message.video.file_id;
  const chatId = message.chat.id;

  // Send stream link back to user
  const streamUrl = `https://your-domain.com/player.html?file_id=${fileId}`;
  await axios.post(`${TELEGRAM_API}/sendMessage`, {
    chat_id: chatId,
    text: `🎬 Here is your video stream link:\n${streamUrl}`
  });

  res.sendStatus(200);
});

// Serve HTML page for video player
app.use(express.static(path.join(__dirname, 'public')));

// Stream video via proxy
app.get('/stream', async (req, res) => {
  const fileId = req.query.file_id;
  if (!fileId) return res.status(400).send('file_id is required');

  try {
    const response = await axios.get(`${TELEGRAM_API}/getFile?file_id=${fileId}`);
    const filePath = response.data.result.file_path;
    const fileUrl = `${TELEGRAM_FILE_API}/${filePath}`;

    https.get(fileUrl, tgRes => {
      res.set({
        'Content-Type': 'video/mp4',
        'Content-Length': tgRes.headers['content-length'],
        'Accept-Ranges': 'bytes'
      });
      tgRes.pipe(res);
    }).on('error', () => {
      res.status(500).send('Failed to stream file');
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).send('Failed to get file');
  }
});

// Start server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
