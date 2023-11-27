// monitoring-log-model.js
import mongoose from "mongoose";
import client from "prom-client";

export const monitoringLogSchema = new mongoose.Schema({
  timestamp: { type: Date, default: Date.now },
  level: String,
  message: String,
  resource_id: String,
  trace_id: String,
  span_id: String,
  commit: String,
  metadata: Object,
});

const readCounter = new client.Counter({
  name: "database_reads_total",
  help: "Total number of database read operations",
});

const writeCounter = new client.Counter({
  name: "database_writes_total",
  help: "Total number of database write operations",
});
monitoringLogSchema.pre("find", function () {
  readCounter.inc();
  // console.log("find plugin to db");
});

monitoringLogSchema.pre("findOne", function () {
  readCounter.inc();
  // console.log("findOne plugin to db");
});

monitoringLogSchema.pre("insertMany", function () {
  writeCounter.inc();
  // console.log("insertMany plugin to db");
});

monitoringLogSchema.pre("save", function () {
  writeCounter.inc();
  // console.log("save plugin to db");
});

const MonitoringLogModel = mongoose.model("MonitoringLog", monitoringLogSchema);

export default MonitoringLogModel;
