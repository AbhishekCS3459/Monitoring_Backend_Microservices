import client from "prom-client";
// const reqResTime = new client.Histogram({
//   name: "http_express_response_time",
//   help: "Response time of http requests in express",
//   labelNames: ["method", "route", "status_code"],
//   buckets: [0.1, 5, 15, 50, 100, 400, 500, 800, 1000], // buckets for response time from 0.1ms to 1000ms
// });
const RedisRead = new client.Counter({
  name: "RedisRead",
  help: "Total number of Read requests in redis",
});

export { RedisRead };
