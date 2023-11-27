import { createLogger, format, log, transport } from "winston";
import LokiTransport from "winston-loki";
// writing logs to transport to loki
const options = {
    labels: {
      jobs: "nodejs-server",
      application: "nodejs-server",
    },
    JSON: true,
    format: format.json(),
    transports: [
      new LokiTransport({
        host: "http://127.0.0.1:3100",
        labels: {
          jobs: "nodejs-server",
          application: "nodejs-server",
        },
        json: true,
        
      }),
    ],
  };
 export const LokiLogger = createLogger(options);
  