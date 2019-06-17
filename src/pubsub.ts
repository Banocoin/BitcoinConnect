import WebSocket from "ws";
import { ISocketMessage } from "./types";
import { pushNotification } from "./notification";
import { logger } from "./logger";

const subs: Map<string, Set<WebSocket>> = new Map();
let msgs: Map<string, Set<ISocketMessage>> = new Map();

const setSub = (topic: string, socket: WebSocket) => {
  const queu =
    subs.get(topic) ||
    (subs.set(topic, new Set()).get(topic) as Set<WebSocket>);
  queu.add(socket);
};
const getSub = (topic: string) => {
  const queu = subs.get(topic);
  if (!queu) return null;
  const res: Array<WebSocket> = [];
  const gc: Array<WebSocket> = [];
  queu.forEach(socket => {
    if (socket.readyState === 2 || socket.readyState === 3) {
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

const setPendingMsgs = (msg: ISocketMessage) => {
  const queu =
    msgs.get(msg.topic) ||
    (msgs.set(msg.topic, new Set()).get(msg.topic) as Set<ISocketMessage>);
  queu.add(msg);
};
const getPendingMsg = (topic: string) => {
  const matching = msgs.get(topic);
  if (matching) {
    msgs.delete(topic);
    return matching;
  } else {
    return null;
  }
};

function socketSend(socket: WebSocket, socketMessage: ISocketMessage) {
  if (socket.readyState === 1) {
    logger.debug(`out  =>${JSON.stringify(socketMessage)}`);
    socket.send(JSON.stringify(socketMessage)); // todo--send fail
  } else {
    setPendingMsgs(socketMessage);
  }
}

const SubController = (socket: WebSocket, socketMessage: ISocketMessage) => {
  const topic = socketMessage.topic;
  setSub(topic, socket);

  const pending = getPendingMsg(topic);

  if (pending) {
    // pending.length
    pending.forEach((pendingMessage: ISocketMessage) =>
      socketSend(socket, pendingMessage)
    );
  }
};

const PubController = (socketMessage: ISocketMessage) => {
  const subscribers = getSub(socketMessage.topic);

  // send push notifications
  pushNotification(socketMessage.topic);

  if (subscribers) {
    subscribers.forEach((socket: WebSocket) =>
      socketSend(socket, socketMessage)
    );
  } else {
    setPendingMsgs(socketMessage);
  }
};

export default (socket: WebSocket, data: WebSocket.Data) => {
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
