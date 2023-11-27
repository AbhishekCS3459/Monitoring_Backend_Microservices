import client from 'prom-client';
export const ResponseTimeDb = new client.Histogram({
    name: "database_response_time",
    help: "Response time of database queries",
    labelNames: ["operation"],
    buckets: [0.1, 5, 15, 50, 100, 400, 500, 800, 1000],
  });