import { redis } from "@/lib/redis";
import { getDate } from "./utils/getDate";
import { parse } from "date-fns";

type AnalyticsArgs = {
  retention?: number;
};

type TrackOptions = {
  persist?: boolean;
};

export class Analytics {
  private retention: number = 60 * 60 * 24 * 7; // 7 days

  constructor(options?: AnalyticsArgs) {
    if (options?.retention) this.retention = options.retention;
  }

  async track(namespace: string, event: object = {}, options?: TrackOptions) {
    let key = `analytics::${namespace}`;

    if (!options?.persist) {
      key += `::${getDate()}`;
    }

    // db call to persist this event
    await redis.hincrby(key, JSON.stringify(event), 1);
    if (!options?.persist) await redis.expire(key, this.retention);
  }

  async retrieveDays(namespace: string, numberOfDays: number) {
    type AnalyticsPromise = ReturnType<typeof analytics.retrieve>;
    const promises: AnalyticsPromise[] = [];

    for (let i = 0; i < numberOfDays; i++) {
      const formattedDate = getDate(i);
      const promise = analytics.retrieve(namespace, formattedDate);
      promises.push(promise);
    }

    const fetched = await Promise.all(promises);

    const data = fetched.sort((a, b) => {
      if (
        parse(a.date, "dd/MM/yyyy", new Date()) >
        parse(b.date, "dd/MM/yyyy", new Date())
      ) {
        return 1;
      } else {
        return -1;
      }
    });

    return data;
  }

  async retrieve(namespace: string, date: string) {
    const res = await redis.hgetall<Record<string, string>>(
      `analytics::${namespace}::${date}`
    );

    return {
      date,
      events: Object.entries(res ?? []).map(([key, value]) => ({
        [key]: Number(value),
      })),
    };
  }
}

export const analytics = new Analytics();
