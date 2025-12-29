import { redis } from "@/lib/redis";
import { parse } from "date-fns";
import { getDate } from "./utils/getDate";

type AnalyticsArgs = {
  retention?: number;
};

type TrackOptions = {
  persist?: boolean;
};

export class Analytics {
  private retention: number = 60 * 60 * 24 * 7; // 7 days

  constructor(opts?: AnalyticsArgs) {
    if (opts?.retention) this.retention = opts.retention;
  }

  async track(namespace: string, event: object = {}, opts?: TrackOptions) {
    let key = `analytics::${namespace}`;

    if (!opts?.persist) {
      key += `::${getDate()}`;
    }

    // db call to persist this event
    await redis.hincrby(key, JSON.stringify(event), 1);
    if (!opts?.persist) await redis.expire(key, this.retention);
  }
}

export const analytics = new Analytics();
