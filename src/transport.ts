import axios from "axios";
import { DestinationParams } from "./types";

export interface Transport {
  send(payload: any): Promise<void> | void;
}

export class TransportFactory {
  make(destinationParams: DestinationParams): Transport {
    if (/^http/.test(destinationParams.transport)) {
      if (!destinationParams.url) {
        throw new Error(
          `Url is not provided. Destination params: ${JSON.stringify(
            destinationParams
          )}`
        );
      }

      const [, methodName] = destinationParams.transport.split(".");
      return new TransportHttp(destinationParams.url, methodName);
    }

    if (/^console/.test(destinationParams.transport)) {
      return new TransportConsole(destinationParams.transport);
    }

    throw new Error(
      `Method of transport is unknown: ${destinationParams.transport}`
    );
  }
}

export class TransportHttp implements Transport {
  constructor(private url: string, private method: string) {}

  async send(payload: any): Promise<void> {
    const res = await axios({
      method: this.method,
      url: this.url,
      headers: {
        "Content-Type": "application/json",
      },
      data: payload,
    });

    if (!(res.status >= 200 && res.status < 300)) {
      throw new Error(
        `HTTP request faild. Message: { 
          response: { status: ${res.status}, 
          body: ${res.data} }, 
          url: ${this.url}, 
          method: ${this.method} }.`
      );
    }
  }
}

export class TransportConsole implements Transport {
  constructor(private method: string) {}

  send(payload: any): void {
    const fn = eval(this.method);
    fn(payload);
  }
}
