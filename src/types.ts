export interface ISocketMessage {
  offset?: number;
  topic: string;
  type: string;
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
