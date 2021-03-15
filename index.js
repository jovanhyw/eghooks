const express = require('express');
const crypto = require('crypto')
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4321;

app.use(express.json({ limit: '10kb' }));

app.get('/hi', (req, res) => {
  res.status(200).send({ msg: 'hi from api' });
});

app.get('/webhook', (req, res) => {
  challengeResponse = req.query.challenge_token;
  console.log("challenge_token:", challengeResponse);

  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send({ 'challenge_token': challengeResponse });
});

app.post('/webhook', (req, res) => {
  console.log(req.body);
  console.log(req.headers);

  signature = req.headers['x-techpass-signature'];
  secret = process.env.WEBHOOK_SECRET;

  // compute and verify hmac hash
  computed = crypto.createHmac("sha256", secret).update(JSON.stringify(req.body)).digest('hex');
  valid = signature === computed

  console.log(computed);
  console.log('verified:', valid);

  if (valid) {
    // do whatever automation when webhook triggered
    res.status(200).send({
      msg: 'webhook received successfully',
      data: req.body
    })
  }
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`)
});