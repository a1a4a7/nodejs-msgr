// services/consumer-G2/consumer-G2.js
const { Kafka } = require('kafkajs');
const WebSocket = require('ws');

const wss = new WebSocket.Server({ port: 8080 });
const kafka = new Kafka({
  clientId: 'consumer-G2',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'G2' });

wss.on('connection', ws => {
  ws.send('Connected to WebSocket server');
});

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'messages', fromBeginning: true });

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = message.value.toString();
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
          client.send(msg);
        }
      });
      console.log(`Broadcasted message: ${msg}`);
    }
  });
};

run().catch(console.error);
