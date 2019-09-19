import WebSocket from "ws";
export interface ISocketMessage {
  isSessionRequest?:boolean
  bridgeVersion?: number;
  offset?: number;
  topic: string;
  type: "pub" | "sub" | "ping";
  payload: string;
}

export class TimeArray<T> extends Array<T> {
  public updateTime: number;
  constructor(...args: any) {
    super(...args);
    this.updateTime = Date.now();
  }
  push(value: any) {
    super.push(value);
    this.updateTime = Date.now();
    return this.length;
  }
}

export class VcClient extends WebSocket {
  public version: number;
  constructor(address: string, options?: WebSocket.ClientOptions | undefined) {
    super(address, options);
    this.version=1;
  }
}
