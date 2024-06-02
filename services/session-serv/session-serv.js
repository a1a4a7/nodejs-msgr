// services/session-serv/session-serv.js
import express from 'express';
import Redis from 'ioredis';
import Redlock from 'redlock';

const app = express();
app.use(express.json());

const redisA = new Redis({ host: process.env.REDIS_HOST_1, port: process.env.REDIS_PORT_1 });
const redisB = new Redis({ host: process.env.REDIS_HOST_2, port: process.env.REDIS_PORT_2 });
const redisC = new Redis({ host: process.env.REDIS_HOST_3, port: process.env.REDIS_PORT_3 });

const redlock = new Redlock(
  [redisA, redisB, redisC],
  {
    driftFactor: 0.01, // multiplied by lock ttl to determine drift time
    retryCount: 10,
    retryDelay: 200, // time in ms
    retryJitter: 200, // time in ms
    automaticExtensionThreshold: 500, // time in ms
  }
);

app.post('/update-session', async (req, res) => {
  const { sessionId, data } = req.body;

  try {
    const lock = await redlock.acquire([`locks:${sessionId}`], 2000);
    await redisA.hset(`sessions:${sessionId}`, data);
    await lock.release();
    res.send('Session updated');
  } catch (err) {
    console.error('Error updating session:', err);
    res.status(500).send('Error updating session');
  }
});

app.listen(3001, () => {
  console.log('Session-serv is running on port 3001');
});
