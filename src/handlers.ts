import { NextFunction, Request, Response } from "express";
import { StrategySelector } from "./strategy";
import jwt from "jsonwebtoken";
import { EventDto, UserDto } from "./types";
import { destinationsConfig } from "./destinations-config";
import { convertPossibleDestionations, initDestionations } from "./destination";
import { plainToClass } from "class-transformer";
import { validate, ValidationError } from "class-validator";

const strategySelector = new StrategySelector();
const destinationsMap = initDestionations(destinationsConfig);

export async function loginHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = plainToClass(UserDto, req.body);
    const errors = await validate(user);
    if (errors.length > 0) {
      const validationErrors = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}))
        .flat();
      return res.status(400).send({ errors: validationErrors });
    }

    // @todo move envs outside or use user credentials from db
    if (
      user.login != process.env.DEFAULT_USER_LOGIN ||
      user.password != process.env.DEFAULT_USER_PASSWORD
    ) {
      res.status(404).send({ error: "User not found." });
      return;
    }

    const token = jwt.sign(
      { login: user.login, password: user.password },
      process.env.JWT_SECRET || "",
      {
        expiresIn: process.env.JWT_EXPIRES,
      }
    );

    res.send({ token });
  } catch (error) {
    next(error);
  }
}

export async function destinationsRouterHandler(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const event = plainToClass(EventDto, req.body);
    const errors = await validate(event);
    if (errors.length > 0) {
      const validationErrors = errors
        .map((error: ValidationError) => Object.values(error.constraints || {}))
        .flat();
      return res.status(400).send({ errors: validationErrors });
    }

    const convertedPossibleDestionations = convertPossibleDestionations(
      event.possibleDestinations
    );

    if (!convertedPossibleDestionations) {
      throw new Error("Array of possible destionations is not provided.");
    }

    const response: Record<string, boolean> = {};
    for (const key in convertedPossibleDestionations) {
      if (
        strategySelector
          .get(event.strategy)
          .IsSatisfiedBy(convertedPossibleDestionations[key])
      ) {
        const destination = destinationsMap.get(key);

        if (!destination) {
          console.log(`log UnknownDestinationError (${key})`);
          response[key] = false;
          continue;
        }

        await destination.execute(event.payload);

        response[key] = true;
      }
    }

    res.send(response);
  } catch (error) {
    next(error);
  }
}
