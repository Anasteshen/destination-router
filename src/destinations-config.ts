import { DestinationParams } from "./types";

export const destinationsConfig: DestinationParams[] = [
  {
    name: "destination1",
    url: "http://localhost:3001",
    transport: "http.post",
  },
  {
    name: "destination2",
    url: "http://localhost:3001",
    transport: "http.put",
  },
  {
    name: "destination3",
    url: "http://localhost:3001",
    transport: "http.get",
  },
  {
    name: "destination4",
    transport: "console.log",
  },
];
