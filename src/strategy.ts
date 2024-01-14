import vm from "vm";

export interface Strategy {
  IsSatisfiedBy(candidate: Array<boolean>): boolean;
}

export class StrategyAll implements Strategy {
  IsSatisfiedBy(candidate: Array<boolean>): boolean {
    if (candidate.length == 0) {
      return false;
    }
    for (const c of candidate) {
      if (!c) {
        return false;
      }
    }
    return true;
  }
}

export class StrategyAny implements Strategy {
  IsSatisfiedBy(candidate: Array<boolean>): boolean {
    if (candidate.length == 0) {
      return false;
    }
    for (const c of candidate) {
      if (c) {
        return true;
      }
    }
    return false;
  }
}

export class StrategyCustom implements Strategy {
  constructor(private customFn: string) {
    console.log("create");
  }

  IsSatisfiedBy(candidate: Array<boolean>): boolean {
    if (candidate.length == 0) {
      return false;
    }

    // @todo secure way to eval custom function.
    try {
      const script = new vm.Script(this.customFn);
      const fn = script.runInNewContext();
      return fn();
    } catch (error) {
      throw new Error(
        `Failed during executing code of provided custom function with error: ${error}`
      );
    }
  }
}

export class StrategySelector {
  get(strategy: string | undefined): Strategy {
    console.log(strategy);

    switch (true) {
      case strategy === "ALL":
        return new StrategyAll();
      case strategy === "ANY":
        return new StrategyAny();
      case strategy !== undefined && isFunctionString(strategy):
        return new StrategyCustom(strategy ?? "");
      default:
        return new StrategyAll();
    }
  }
}

function isFunctionString(str: string): boolean {
  try {
    new Function(str);
    return true;
  } catch (error) {
    return false;
  }
}
