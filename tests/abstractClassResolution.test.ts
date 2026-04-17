import "reflect-metadata";
import { Container } from "../src/Container";
import { Implements, Injectable } from "../src/decorators";

describe("Success", () => {
  test("Resolves the correct implementation when `container.get(AbstractClass)` is called directly", () => {
    abstract class Repository {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {}

    const container = new Container();
    const repository = container.get(Repository);

    expect(repository).toBeInstanceOf(SqlRepository);
  });

  test("Resolves the correct implementation when the abstract class appears as a constructor parameter mid-tree", () => {
    abstract class Repository {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {}

    @Injectable()
    class UserService {
      constructor(public repository: Repository) {}
    }

    const container = new Container();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(SqlRepository);
  });

  test("Resolves the correct implementation with its dependencies recursively", () => {
    abstract class Repository {}

    @Injectable()
    class Config {}

    @Injectable()
    class Logger {
      constructor(public config: Config) {}
    }

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {
      constructor(public logger: Logger) {}
    }

    @Injectable()
    class UserService {
      constructor(public repository: Repository) {}
    }

    const container = new Container();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(SqlRepository);
    expect((userService.repository as SqlRepository).logger).toBeInstanceOf(
      Logger,
    );
    expect(
      (userService.repository as SqlRepository).logger.config,
    ).toBeInstanceOf(Config);
  });

  test("Resolves the concrete class directly after `@Implements` is applied to it", () => {
    abstract class Repository {}

    @Injectable()
    class Logger {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {
      constructor(public logger: Logger) {}
    }

    const container = new Container();
    const repository = container.get(SqlRepository);

    expect(repository).toBeInstanceOf(SqlRepository);
    expect(repository.logger).toBeInstanceOf(Logger);
  });
});

// describe("Failure", () => {
//   test("Must throw a clear error if the abstract class has no implementation", () => {
//     abstract class Repository {}

//     const container = new Container();
//     expect(() => container.get(Repository)).toThrow(
//       `Cannot resolve dependency Repository. No implementation found.`,
//     );
//   });
// });
