import fastify from "fastify";
import Helmet from "fastify-helmet";
import WebSocket from "ws";
import config from "./config";
import pubsub, { agent } from "./pubsub";
import { setNotification } from "./notification";
import pkg from "../package.json";
import { logger } from "./logger";
const startAt = new Date();

const app = fastify({
  logger: {
    level: "error"
  }
});
app.register(Helmet);

// for container health checks
app.get("/health", (_, res) => {
  res.status(200).send(startAt.toLocaleString());
});

app.get("/hello", (req, res) => {
  res.status(200).send(`Hello World, this is WalletConnect v${pkg.version}`);
});

app.get("/info", (req, res) => {
  res.status(200).send({
    name: pkg.name,
    description: pkg.description,
    version: pkg.version
  });
});

app.get("/performance", (req, res) => {
  const counts = (req.query && req.query["counts"]) || 100;
  res.status(200).send(agent.getStatisticsInfo(Number(counts)));
});

app.post("/setMyPong", (req, res) => {
    res.status(200).send()
});

app.post("/subscribe", (req, res) => {
  if (!req.body || typeof req.body !== "object") {
    res.status(400).send({
      message: "Error: missing or invalid request body"
    });
  }

  const { topic, webhook } = req.body;

  if (!topic || typeof topic !== "string") {
    res.status(400).send({
      message: "Error: missing or invalid topic field"
    });
  }

  if (!webhook || typeof webhook !== "string") {
    res.status(400).send({
      message: "Error: missing or invalid webhook field"
    });
  }

  setNotification(topic, webhook);

  res.status(200).send({
    success: true
  });
});

const wsServer = new WebSocket.Server({ server: app.server });

app.ready(() => {
  wsServer.on("connection", (socket: WebSocket) => {
    socket.on("message", async data => {
      pubsub(socket, data);
    });
  });
});

const [host, port] = config.host.split(":");
app.listen(+port, host, (err, address) => {
  if (err) throw err;
  logger.info(`Server listening on ${address}`);
  app.log.info(`Server listening on ${address}`);
});
