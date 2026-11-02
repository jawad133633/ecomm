require("dotenv").config();

const { NodeSDK } = require("@opentelemetry/sdk-node");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { OTLPMetricExporter } = require("@opentelemetry/exporter-metrics-otlp-http");
const { PeriodicExportingMetricReader } = require("@opentelemetry/sdk-metrics");

const otlpEndpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT;

const sdkOptions = {
  serviceName: process.env.OTEL_SERVICE_NAME || "markethub-api",
  instrumentations: [
    getNodeAutoInstrumentations({
      "@opentelemetry/instrumentation-fs": { enabled: false }, // Avoid cluttering traces with internal file reads
    }),
  ],
};

if (otlpEndpoint) {
  try {
    sdkOptions.traceExporter = new OTLPTraceExporter({
      url: otlpEndpoint.endsWith("/v1/traces") ? otlpEndpoint : `${otlpEndpoint.replace(/\/$/, "")}/v1/traces`,
    });
    sdkOptions.metricReader = new PeriodicExportingMetricReader({
      exporter: new OTLPMetricExporter({
        url: otlpEndpoint.endsWith("/v1/metrics") ? otlpEndpoint : `${otlpEndpoint.replace(/\/$/, "")}/v1/metrics`,
      }),
      exportIntervalMillis: 15000,
    });
    console.log(`[OpenTelemetry] Exporting traces & metrics to OTLP endpoint: ${otlpEndpoint}`);
  } catch (err) {
    console.warn("[OpenTelemetry] OTLP Exporter setup note:", err.message);
  }
}

let sdk;
try {
  sdk = new NodeSDK(sdkOptions);
  sdk.start();
  console.log("MarketHub OpenTelemetry initialized with auto-instrumentation");
} catch (err) {
  console.warn("OpenTelemetry initialization notice:", err.message);
}

process.on("SIGTERM", () => {
  if (sdk) {
    sdk.shutdown()
      .then(() => console.log("OpenTelemetry terminated gracefully"))
      .catch((err) => console.error("Error terminating OpenTelemetry", err))
      .finally(() => process.exit(0));
  }
});

module.exports = sdk;
