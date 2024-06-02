// services/consumer-G1/consumer-G1.js
const { MongoClient } = require('mongodb');
const { Kafka } = require('kafkajs');

const kafka = new Kafka({
  clientId: 'consumer-G1',
  brokers: [process.env.KAFKA_BROKER]
});

const consumer = kafka.consumer({ groupId: 'G1' });

const run = async () => {
  await consumer.connect();
  await consumer.subscribe({ topic: 'messages', fromBeginning: true });

  const client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  const db = client.db('chat');
  const collection = db.collection('messages');

  await consumer.run({
    eachMessage: async ({ topic, partition, message }) => {
      const msg = message.value.toString();
      await collection.insertOne({ message: msg });
      console.log(`Stored message: ${msg}`);
    }
  });
};

run().catch(console.error);
