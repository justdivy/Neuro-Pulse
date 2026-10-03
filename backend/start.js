const http = require("http");

const port = Number(process.env.PORT || 5000);
const healthRequest = http.get(
  { hostname: "127.0.0.1", port, path: "/api/health", timeout: 1000 },
  (response) => {
    response.resume();
    console.log(`Neuro-Pulse backend is already running on port ${port}.`);
    process.exit(0);
  }
);

healthRequest.on("timeout", () => {
  healthRequest.destroy();
  startServer();
});

healthRequest.on("error", (error) => {
  if (error.code === "ECONNREFUSED" || error.code === "ECONNRESET") {
    startServer();
    return;
  }

  console.error(`Unable to check port ${port}: ${error.message}`);
  process.exit(1);
});

function startServer() {
  require("./server.js");
}
