const Redis = require("ioredis");

let redisClient = null;

redisClient = new Redis({
  host: `${process.env.REDIS_HOST}`,
  port: Number(process.env.REDIS_PORT || 6379),
  password: `${process.env.REDIS_PASSWORD}`,
});

module.exports = redisClient;
