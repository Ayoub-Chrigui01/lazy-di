import "reflect-metadata";
import { Container } from "../src/Container";
import { Injectable } from "../src/decorators";

describe("Success", () => {
  test("Must resolve a class with zero dependencies", () => {
    @Injectable()
    class Logger {}

    const container = Container.create();
    const logger = container.get(Logger);

    expect(logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a class with one dependency", () => {
    @Injectable()
    class Logger {}

    @Injectable()
    class UserService {
      constructor(public logger: Logger) {}
    }

    const container = Container.create();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a class with multiple dependencies", () => {
    @Injectable()
    class Logger {}

    @Injectable()
    class Database {}

    @Injectable()
    class UserService {
      constructor(
        public logger: Logger,
        public database: Database,
      ) {}
    }

    const container = Container.create();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.logger).toBeInstanceOf(Logger);
    expect(userService.database).toBeInstanceOf(Database);
  });

  test("Must resolve a class with multiple levels of dependencies", () => {
    @Injectable()
    class Logger {}

    @Injectable()
    class UserRepository {
      constructor(public logger: Logger) {}
    }

    @Injectable()
    class UserService {
      constructor(public userRepository: UserRepository) {}
    }

    const container = Container.create();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.userRepository).toBeInstanceOf(UserRepository);
    expect(userService.userRepository.logger).toBeInstanceOf(Logger);
  });

  test("Must resolve a subclass with no dependencies", () => {
    @Injectable()
    class Config {}

    @Injectable()
    class BaseService {
      constructor(public config: Config) {}
    }

    @Injectable()
    class ExtendedService extends BaseService {}

    const container = Container.create();
    const extendedService = container.get(ExtendedService);

    expect(extendedService).toBeInstanceOf(ExtendedService);
    expect(extendedService).toBeInstanceOf(BaseService);
    expect(extendedService.config).toBeInstanceOf(Config);
  });

  test("Must resolve a subclass with dependencies", () => {
    @Injectable()
    class Config {}

    @Injectable()
    class BaseService {
      constructor(public config: Config) {}
    }

    @Injectable()
    class Database {}

    @Injectable()
    class ExtendedService extends BaseService {
      constructor(
        public database: Database,
        public config: Config,
      ) {
        super(config);
      }
    }

    const container = Container.create();
    const extendedService = container.get(ExtendedService);

    expect(extendedService).toBeInstanceOf(ExtendedService);
    expect(extendedService).toBeInstanceOf(BaseService);
    expect(extendedService.database).toBeInstanceOf(Database);
    expect(extendedService.config).toBeInstanceOf(Config);
  });
});

describe("Failure", () => {
  test("Must throw an error when a dependency is not decorated with @Injectable() with full resolution path", () => {
    @Injectable()
    class Config {}

    class Logger {
      constructor(public config: Config) {}
    }

    @Injectable()
    class UserService {
      constructor(public logger: Logger) {}
    }

    const container = Container.create();

    expect(() => container.get(UserService)).toThrow(
      "Cannot resolve dependency Logger. Make sure it is decorated with @Injectable().",
    );
  });

  test("Must throw an error when a dependency with zero dependencies is not decorated with @Injectable()", () => {
    class Config {}

    const container = Container.create();

    expect(() => container.get(Config)).toThrow(
      "Cannot resolve dependency Config. Make sure it is decorated with @Injectable().",
    );
  });
});
