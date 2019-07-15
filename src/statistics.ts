const STEP = 30 * 1000;
const DEAD_COUNT = 3;
import WebSocket from "ws";
import { logger } from "./logger";

interface IStatisticsInfo {
  alive: number;
  gc: number;
  notAlive: number;
}

export class Agent {
  private storageMap: Map<string, number>;
  private target: Map<string, Set<WebSocket>>;
  private statisticsInfo: Array<IStatisticsInfo>;
  private step: 0;
  private startTime: Date;
  constructor(target: Map<string, Set<WebSocket>>) {
    this.target = target;
    this.storageMap = new Map();
    this.step = 0;
    this.startTime = new Date();
    this.statisticsInfo = [];
    setInterval(() => {
      this.step += 1;
      const state = { alive: 0, gc: 0, notAlive: 0 };

      try {
        this.checkMap(this.target, state);
        this.gcMap(this.target, state);
      } catch (e) {
        logger.error(e);
      } finally {
        this.statisticsInfo.push(state);
      }
    }, STEP);
  }
  checkMap(subs: Map<string, Set<WebSocket>>, state: IStatisticsInfo) {
    for (const key of this.target.keys()) {
      const t=this.target.get(key);
      
      if (!t||Array.from(t).every((s)=>s.readyState===s.CLOSED)) {
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
    }
  }
  gcMap(subs: Map<string, Set<WebSocket>>, state: IStatisticsInfo) {
    for (const key of this.storageMap.keys()) {
      const counter = this.storageMap.get(key);
      if (counter && counter >= DEAD_COUNT) {
        state.gc += 1;
        this.storageMap.delete(key);
        this.target.delete(key);
      }
    }
  }

  getStatisticsInfo(n: number = 100) {
    return JSON.stringify({
      data: this.statisticsInfo.slice(-n),
      step: this.step,
      startTime: this.startTime.toLocaleString()
    });
  }
}
