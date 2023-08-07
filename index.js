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

const verifyWebhookEndpoint = (req, res) => {
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.headers', JSON.stringify(req.headers, null, 2));

  challengeResponse = req.query.challengeToken;
  console.log("challenge_token:", challengeResponse);

  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.status(200).send({ 'challengeToken': challengeResponse });
};

const verifySecret = (req) => {
  console.log('new webhook:\n');
  console.log('req.body:', JSON.stringify(req.body, null, 2));
  console.log('req.headers', JSON.stringify(req.headers, null, 2));

  // 1. Save the current timestamp of the received request to a variable
  timeReceived = Math.floor(new Date().getTime() / 1000)
  console.log('timeReceived:', timeReceived);
  secret = process.env.WEBHOOK_SECRET;

  // 2. From the X-TECHPASS-SIGNATURE header, extract the timestamp and signatures
  signature = req.headers['x-techpass-signature'];
  const [timekv, signedKv] = signature.split(',')
  const [, timeSent] = timekv.split('=')
  console.log('timeSent:', timeSent);
  const [, signedHash] = signedKv.split('=')
  console.log('signedHash:', signedHash);

  console.log('time difference:', timeReceived - timeSent);

  // If more than 5 mins, treat it as a replay attack and ignore request
  if (timeReceived - timeSent > (60 * 5)) {
    console.log('replay atk');
    return false
  }

  // 3. Save the raw JSON payload to a variable
  reqPayload = JSON.stringify(req.body);
  // 4. Prepare the signature payload by concatenating the timestamp and JSON payload together, using a colon(:) as a delimiter.
  signedPayload = `${timeSent}:${reqPayload}`
  // 5. Compute a SHA256 HMAC of the signature payload by using your webhook secret as the key.
  // 6. Compute the hex digest of the HMAC.
  try {
    computed = crypto.createHmac("sha256", secret).update(signedPayload).digest('hex');
  } catch (err) {
    console.error('err on computing hmac:', err);
    console.warn('Did you forget to set .env WEBHOOK_SECRET ?')
  }
  // 7. Compare your computed signature against the signature extracted from
  valid = signedHash === computed

  console.log('computed:', computed);
  console.log('verified:', valid);
  return valid
}


app.get('/webhook', verifyWebhookEndpoint);
app.post('/webhook', async (req, res) => {
  valid = verifySecret(req)
  if (valid) {
    // do whatever automation when webhook triggered
    res.status(200).send({
      msg: 'webhook received successfully',
      data: req.body
    })
  } else {
    // return 200 just to reply to webhook
    res.status(200).send()
  }
  console.log('message completed.\n');
});

app.get('/webhook500', verifyWebhookEndpoint);
app.post('/webhook500', async (req, res) => {
  valid = verifySecret(req)
  // do whatever automation when webhook triggered
  res.status(503).send({
    error: {
      code: "999",
      traceId: "abcd1234",
      message: "mock error",
    }
  })
  console.log('message completed.\n');
});

app.listen(PORT, () => {
  console.log(`Express server started on port ${PORT}`)
});