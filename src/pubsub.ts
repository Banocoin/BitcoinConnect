import WebSocket from "ws";
import { ISocketMessage } from "./types";
import { pushNotification } from "./notification";
import { logger } from "./logger";
import { Agent } from "./statistics";
import { TimeArray,VcClient } from "./types";



export const subs: Map<string, Set<VcClient>> = new Map();
export let msgs: Map<string, TimeArray<ISocketMessage>> = new Map();

export const agent = new Agent(subs, msgs);
const setSub = (topic: string, socket: VcClient) => {
  const queu =
    subs.get(topic) || (subs.set(topic, new Set()).get(topic) as Set<VcClient>);
  queu.add(socket);
};
const getSub = (topic: string) => {
  const queu = subs.get(topic);
  if (!queu) return null;
  const res: Array<VcClient> = [];
  const gc: Array<VcClient> = [];
  queu.forEach(socket => {
    if (socket.readyState === socket.CLOSED) {
      gc.push(socket);
    } else if (socket.readyState === 1) {
      res.push(socket);
    }
  });
  if (res.length === 0) {
    subs.delete(topic);
    return null;
  }
  gc.forEach(s => queu.delete(s)); //
  return res;
};

function socketSend(socket: VcClient, socketMessage: ISocketMessage) {
  logger.debug(`send:${socket.readyState}`);
  if (socket.readyState === 1) {
    logger.debug(`out  =>${JSON.stringify(socketMessage)}`);
    try {
      socket.send(JSON.stringify(socketMessage)); // todo--send fail
    } catch (e) {
      logger.debug(`sendFail:${socketMessage}`);
    }
  }
}

const SubController = (socket: VcClient, socketMessage: ISocketMessage) => {
  const topic = socketMessage.topic;
  const offset = Number.isInteger(socketMessage.offset as number)
    ? (socketMessage.offset as number) + 1
    : 0;
  const version = socketMessage.version || 1;

  logger.debug(`subbbb:${topic}------offset:${offset}`);
  socket.version=version
  setSub(topic, socket);
  const msgQueu = msgs.get(socketMessage.topic);
  if (msgQueu && msgQueu.length) {
    msgQueu
      .slice(offset)
      .forEach((pendingMessage: ISocketMessage) =>
        socketSend(socket, pendingMessage)
      );
  }
};

const PubController = (socketMessage: ISocketMessage) => {
  logger.debug(`pubController,receive${socketMessage}`);
  const subscribers = getSub(socketMessage.topic);
  let msgQueu = msgs.get(socketMessage.topic);
  if (!msgQueu) {
    msgQueu = new TimeArray();
    msgs.set(socketMessage.topic, msgQueu);
  }
  socketMessage.offset = msgQueu.length;
  msgQueu.push(socketMessage);
  // send push notifications
  pushNotification(socketMessage.topic);

  if (subscribers) {
    subscribers.forEach((socket: VcClient) =>
      socketSend(socket, socketMessage)
    );
  }
};

export default (socket: VcClient, data: WebSocket.Data) => {
  const message: string = String(data);

  if (message) {
    if (message === "ping") {
      if (socket.readyState === 1) {
        socket.send("pong");
      }
    } else {
      let socketMessage: ISocketMessage;

      try {
        socketMessage = JSON.parse(message);

        logger.debug(`IN  =>${JSON.stringify(socketMessage)}`);

        switch (socketMessage.type) {
          case "sub":
            SubController(socket, socketMessage);
            break;
          case "pub":
            PubController(socketMessage);
            break;
          default:
            break;
        }
      } catch (e) {
        logger.error(`parseMsgErr:${JSON.stringify(e)}`);
      }
    }
  }
};
