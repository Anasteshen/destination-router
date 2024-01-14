import jwt from "jsonwebtoken";
import { Request, Response, NextFunction, RequestHandler } from "express";
import { Collection, Document } from "mongodb";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

export function authenticateTokenMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.JWT_SECRET || "", (err: any) => {
    if (err) {
      return res.sendStatus(403);
    }

    next();
  });
}

export function createMongoDBLoggerMiddleware(
  collection: Collection<Document>
) {
  return async function logIntoMongoDB(
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> {
    let oldSend = res.send;
    let mongoResponse: any;

    res.send = (body) => {
      mongoResponse = body;
      res.send = oldSend;
      return res.send(body);
    };

    res.on("finish", async () => {
      await collection.insertOne({
        request: req.body,
        response: mongoResponse,
      });
    });

    next();
  };
}

export function createDTOValidationMiddleware<T extends object>(
  dtoClass: new () => T
) {
  return async function DTOValidationMiddleware(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    const dtoObject = plainToClass(dtoClass, req.body);
    const errors = await validate(dtoObject);

    if (errors.length > 0) {
      const validationErrors = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}))
        .flat();
      return res.status(400).send({ errors: validationErrors });
    }

    req.body = dtoObject;
    next();
  };
}
