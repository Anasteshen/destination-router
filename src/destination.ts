import axios from "axios";
import { Transport, TransportFactory } from "./transport";
import { DestinationParams } from "./types";

const transportFactory = new TransportFactory();

export class Destination {
  constructor(private name: string, private transport: Transport) {}

  async execute(payload: any): Promise<void> {
    try {
      await this.transport.send(payload);
    } catch (error: any) {
      throw new Error(
        `Destination ${this.name} failed to send payload. ERROR: ${error.message}`
      );
    }
  }
}

export function initDestionations(
  config: DestinationParams[]
): Map<string, Destination> {
  const destinationsMap = new Map();
  for (const params of config) {
    const transport = transportFactory.make(params);
    const destination = new Destination(params.name, transport);

    destinationsMap.set(params.name, destination);
  }

  return destinationsMap;
}

export function convertPossibleDestionations(
  possibleDestinations: Array<Record<string, boolean>>
): Record<string, boolean[]> | null {
  if (possibleDestinations.length < 1) {
    return null;
  }

  let destinations: Record<string, boolean[]> = {};
  for (let i = 0; i < possibleDestinations.length; i++) {
    for (const [key, value] of Object.entries(possibleDestinations[i])) {
      if (!destinations[key]) {
        destinations[key] = [];
      }

      destinations[key].push(value);
    }
  }

  return destinations;
}
