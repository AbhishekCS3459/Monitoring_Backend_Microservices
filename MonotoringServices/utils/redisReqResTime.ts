import client from 'prom-client';
const RedisreqResTime = new client.Histogram({
    name: "RedisreqResTime",
    help: "Response time of http requests in redis",
    labelNames: ["method", "route", "status_code"],
    buckets: [0.1, 5, 15, 50, 100, 400, 500, 800, 1000], // buckets for response time from 0.1ms to 1000ms
  });
  
export { RedisreqResTime };  