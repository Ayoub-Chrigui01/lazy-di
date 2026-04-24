import "reflect-metadata";
import { Container } from "../src/Container";
import { Abstract, Implements, Injectable } from "../src/decorators";

describe("Success", () => {
  test("Resolves the correct implementation when `container.get(AbstractClass)` is called directly", () => {
    @Abstract()
    abstract class Repository {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {}

    const container = Container.create();
    const repository = container.get(Repository);

    expect(repository).toBeInstanceOf(SqlRepository);
  });

  test("Resolves the correct implementation when the abstract class appears as a constructor parameter mid-tree", () => {
    @Abstract()
    abstract class Repository {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {}

    @Injectable()
    class UserService {
      constructor(public repository: Repository) {}
    }

    const container = Container.create();
    const userService = container.get(UserService);

    expect(userService).toBeInstanceOf(UserService);
    expect(userService.repository).toBeInstanceOf(SqlRepository);
  });

  test("Resolves the correct implementation with its dependencies recursively", () => {
    @Abstract()
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

    const container = Container.create();
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
    @Abstract()
    abstract class Repository {}

    @Injectable()
    class Logger {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {
      constructor(public logger: Logger) {}
    }

    const container = Container.create();
    const repository = container.get(SqlRepository);

    expect(repository).toBeInstanceOf(SqlRepository);
    expect(repository.logger).toBeInstanceOf(Logger);
  });

  test("Resolves the correct implementation if `when` option is used in `@Implements` and the condition is true", () => {
    @Abstract()
    abstract class Repository {}

    @Injectable()
    @Implements(Repository, { when: true })
    class SqlRepository implements Repository {
      constructor() {}
    }

    const container = Container.create();
    const repository = container.get(Repository);

    expect(repository).toBeInstanceOf(SqlRepository);
  });

  test("Resolves the correct implementation if `when` option is used in `@Implements` and the condition is false for one implementation but true for another", () => {
    @Abstract()
    abstract class Repository {}

    @Injectable()
    @Implements(Repository, { when: false })
    class SqlRepository implements Repository {
      constructor() {}
    }

    @Injectable()
    @Implements(Repository, { when: true })
    class MongoRepository implements Repository {
      constructor() {}
    }

    const container = Container.create();
    const repository = container.get(Repository);

    expect(repository).toBeInstanceOf(MongoRepository);
  });
});

describe("Failure", () => {
  test("Must throw when an abstract class is not decorated with @Abstract() and another class tries to implement it", () => {
    abstract class Repository {}

    expect(() => {
      @Injectable()
      @Implements(Repository)
      class SqlRepository implements Repository {}
    }).toThrow(
      "Repository must be decorated with @Abstract() before it can be implemented by another class.",
    );
  });

  test("Must throw a clear error if the abstract class has no implementation", () => {
    @Abstract()
    abstract class Repository {}

    const container = Container.create();
    expect(() => container.get(Repository)).toThrow(
      `Cannot resolve dependency Repository. No implementation found.`,
    );
  });

  test("Must throw when multiple implementations are registered for the same abstract class", () => {
    @Abstract()
    abstract class Repository {}

    @Injectable()
    @Implements(Repository)
    class SqlRepository implements Repository {}

    expect(() => {
      @Injectable()
      @Implements(Repository)
      class MongoRepository implements Repository {}
    }).toThrow(
      `MongoRepository cannot implement Repository. Repository is already implemented by SqlRepository.`,
    );
  });
});
