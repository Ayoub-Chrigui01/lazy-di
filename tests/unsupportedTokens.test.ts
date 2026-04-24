import "reflect-metadata";
import { Injectable } from "../src/decorators";

describe("It should throw error", () => {
  test("When a dependency has an interface in the constructor", () => {
    interface IServiceA {}

    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public serviceA: IServiceA) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Object' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type in the constructor", () => {
    type User = { name: string };

    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: User) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Object' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type any in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: any) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Object' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type unknown in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: unknown) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Object' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type string in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: string) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'String' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type number in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: number) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Number' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has a type boolean in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: boolean) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Boolean' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has an array in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: string[]) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Array' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a dependency has an array in the constructor", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: string[]) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index ${0} resolved to 'Array' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
    );
  });

  test("When a circular dependency happen and causes undefined", () => {
    expect(() => {
      @Injectable()
      class ServiceB {
        constructor(public user: undefined) {}
      }
    }).toThrow(
      `[ServiceB] cannot be registered: parameter at index 0 has no type metadata.
          This usually means a circular import. Check your imports for cycles.`,
    );
  });
});
