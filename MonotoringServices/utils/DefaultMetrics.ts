import client from 'prom-client';
export const collectDefaultMetrics = client.collectDefaultMetrics;
collectDefaultMetrics({
  register: client.register,
});
