import express, { Express, NextFunction, Request, Response } from "express";
import * as dotenv from "dotenv";
import {
  authenticateTokenMiddleware,
  createDTOValidationMiddleware,
  createMongoDBLoggerMiddleware,
} from "./middleware";
import { destinationsRouterHandler, loginHandler } from "./handlers";
import { EventDto, UserDto } from "./types";
import { MongoClient } from "mongodb";

// configuration
dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;
const mongoDbName = process.env.MONGODB_NAME;

app.use(express.json());

// boot up the app and start server
async function run() {
  const client = await initMongoDB();
  try {
    const mongoDBLoggerMiddleware = createMongoDBLoggerMiddleware(
      client.db(mongoDbName).collection("events")
    );

    app.use(mongoDBLoggerMiddleware);

    // login as a default user
    app.post("/login", createDTOValidationMiddleware(UserDto), loginHandler);

    // events destination resolver
    app.post(
      "/router",
      authenticateTokenMiddleware,
      createDTOValidationMiddleware(EventDto),
      destinationsRouterHandler
    );

    app.listen(port, () => {
      console.log(`[server]: Server is running at http://localhost:${port}`);
    });
  } finally {
    await client.close();
  }
}
run();

async function initMongoDB(): Promise<MongoClient> {
  const uri = process.env.MONGODB_URI || "mongodb://localhost:27017/";
  const mongoClient = new MongoClient(uri, {
    connectTimeoutMS: 5_000,
    serverSelectionTimeoutMS: 5_000,
  });

  // retriable connection in case mongo container isn't ready yet
  let attempt = 0;
  while (true) {
    try {
      console.log(`Connection to MongoDB (${uri})`);
      const conn = await mongoClient.connect();
      await conn.db("admin").command({ ping: 1 });
      console.log("Connected successfully to MongoDB");
      return conn;
    } catch (error: any) {
      attempt++;
      console.log(
        `MongoDB connection failed :${error.message}, attempt ${attempt}`
      );
      if (attempt >= 5) {
        throw error;
      }
    }
  }
}

/*
 *  Use this endopoints for testing
 */
const testApp: Express = express();
const testPort = 3001;

testApp.listen(testPort, () => {
  console.log(
    `[server]: Test server is running at http://localhost:${testPort}`
  );
});

testApp.post("/", (req: Request, res: Response) => {
  console.log("localhost:3001 POST, data:  ", req.body);
  res.sendStatus(200);
});

testApp.put("/", (req: Request, res: Response) => {
  console.log("localhost:3001 PUT, data:  ", req.body);
  res.sendStatus(200);
});

testApp.get("/", (req: Request, res: Response) => {
  console.log("localhost:3001 GET, data:  ", req.body);
  res.sendStatus(200);
});
