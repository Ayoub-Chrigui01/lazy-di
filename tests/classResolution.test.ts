import "reflect-metadata";
import { Container } from "../src/Container";
import { Injectable } from "../src/decorators";

describe("Success", () => {
  test("Must resolve a class with zero dependencies", () => {
    class Logger {}

    const container = new Container();
    const logger = container.get(Logger);

    expect(logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a class with one dependency", () => {
    class Logger {}

    @Injectable()
    class UserService {
      constructor(public logger: Logger) {}
    }

    const container = new Container();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a class with multiple dependencies", () => {
    class Logger {}

    class Database {}

    @Injectable()
    class UserService {
      constructor(
        public logger: Logger,
        public database: Database,
      ) {}
    }

    const container = new Container();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.logger).toBeInstanceOf(Logger);
    expect(userService.database).toBeInstanceOf(Database);
  });

  test("Must resolve a class with multiple levels of dependencies", () => {
    class Logger {}

    @Injectable()
    class UserRepository {
      constructor(public logger: Logger) {}
    }

    @Injectable()
    class UserService {
      constructor(public userRepository: UserRepository) {}
    }

    const container = new Container();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.userRepository).toBeInstanceOf(UserRepository);
    expect(userService.userRepository.logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a subclass with no dependencies", () => {
    class Config {}

    @Injectable()
    class BaseService {
      constructor(public config: Config) {}
    }

    class ExtendedService extends BaseService {}

    const container = new Container();
    const extendedService = container.get(ExtendedService);

    expect(extendedService).toBeInstanceOf(ExtendedService);
    expect(extendedService).toBeInstanceOf(BaseService);
    expect(extendedService.config).toBeInstanceOf(Config);
  });

  test("Must resolve a subclass with dependencies", () => {
    class Config {}

    @Injectable()
    class BaseService {
      constructor(public config: Config) {}
    }

    class Database {}

    @Injectable()
    class ExtendedService extends BaseService {
      constructor(
        public database: Database,
        config: Config,
      ) {
        super(config);
      }
    }

    const container = new Container();
    const extendedService = container.get(ExtendedService);

    expect(extendedService).toBeInstanceOf(ExtendedService);
    expect(extendedService).toBeInstanceOf(BaseService);
    expect(extendedService.database).toBeInstanceOf(Database);
    expect(extendedService.config).toBeInstanceOf(Config);
  });
});

describe("Failure", () => {
  test("Must throw an error when a dependency is not decorated with @Injectable() with full resolution path", () => {
    class Config {}

    class Logger {
      constructor(public config: Config) {}
    }

    @Injectable()
    class UserService {
      constructor(public logger: Logger) {}
    }

    const container = new Container();

    expect(() => container.get(UserService)).toThrow(
      "Cannot resolve dependency Logger. Make sure it is decorated with @Injectable().",
    );
  });

  test("Must throw an error when a dependency with zero dependencies is not decorated with @Injectable()", () => {
    @Injectable()
    class Config {}

    const container = new Container();

    expect(() => container.get(Config)).toThrow(
      "Cannot resolve dependency Config. Make sure it is decorated with @Injectable().",
    );
  });
});
