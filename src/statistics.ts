const STEP = 20 * 60 * 1000;
const DEAD_COUNT = 3;
import WebSocket from "ws";

interface IStatisticsInfo {
  alive: number;
  gc: number;
  notAlive: number;
}

export class Agent {
  private storageMap: Map<string, number>;
  private target: Map<string, Set<WebSocket>>;
  private statisticsInfo: Map<number, IStatisticsInfo>;
  private step: 0;
  private startTime: Date;
  constructor(target: Map<string, Set<WebSocket>>) {
    this.target = target;
    this.storageMap = new Map();
    this.step = 0;
    this.startTime = new Date();
    this.statisticsInfo = new Map();
    setTimeout(() => {
      this.step += 1;
      this.statisticsInfo.set(this.step, { alive: 0, gc: 0, notAlive: 0 });
      try {
        this.checkMap(this.target);
        this.gcMap(this.target);
      } catch (e) {}
    }, 2000);
  }
  checkMap(subs: Map<string, Set<WebSocket>>) {
    const state = this.statisticsInfo.get(this.step) || {
      alive: 0,
      gc: 0,
      notAlive: 0
    };
    for (const key in this.target.keys()) {
      if (
        Array.prototype.every.call(
          this.target.get(key) as Set<WebSocket>,
          (socket: WebSocket) => {
            return socket.CLOSED === socket.readyState;
          }
        )
      ) {
        const counts = this.storageMap.get(key);
        if (!counts) {
          this.storageMap.set(key, 1);
        } else {
          this.storageMap.set(key, counts + 1);
        }
        state.notAlive += 1;
      } else {
        state.alive += 1;
      }
      this.statisticsInfo.set(this.step, state);
    }
  }
  gcMap(subs: Map<string, Set<WebSocket>>) {
    const state = this.statisticsInfo.get(this.step) || {
      alive: 0,
      gc: 0,
      notAlive: 0
    };

    for (const key in this.storageMap.keys()) {
      const counter = this.storageMap.get(key);
      if (counter && counter >= DEAD_COUNT) {
        state.gc += 1;
        this.storageMap.delete(key);
        this.target.delete(key);
      }
    }
    this.statisticsInfo.set(this.step, state);
  }

  getStatisticsInfo(n: number = 100) {
    if (n < this.step) {
      const p: Map<Number, IStatisticsInfo> = new Map();
      for (let i = this.step; i >= this.step - n; i--) {
        p.set(
          i,
          this.statisticsInfo.get(i) || { alive: 0, gc: 0, notAlive: 0 }
        );
      }
    } else {
      return this.statisticsInfo;
    }
  }
}
