const express = require('express');

const app = express();
const PORT = process.env.PORT || 4321;

app.use(express.json({ limit: '10kb' }));

app.get('/hi', (req, res) => {
  res.status(200).send({ msg: 'hi from api' });
});

app.get('/test', (req, res) => {
  challengeResponse = req.query.challenge;

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send(challengeResponse);
});

app.post('/test', (req, res) => {
  console.log(req.body);
  res.status(200).send({
    msg: 'webhook received successfully',
    data: req.body
  })
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`)
});