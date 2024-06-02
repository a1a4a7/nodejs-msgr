// services/msg-serv/msg-serv.js
const express = require('express');
const { Kafka } = require('kafkajs');

const app = express();
app.use(express.json());

const kafka = new Kafka({
  clientId: 'msg-serv',
  brokers: [process.env.KAFKA_BROKER]
});

const producer = kafka.producer();

app.post('/send', async (req, res) => {
  const { message } = req.body;

  await producer.connect();
  await producer.send({
    topic: 'messages',
    messages: [{ value: message }],
  });

  res.send('Message sent');
});

app.listen(3000, () => {
  console.log('Msg-serv is running on port 3000');
});
