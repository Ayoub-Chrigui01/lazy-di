import "reflect-metadata";
import { Container } from "../src/Container";
import { Implements } from "../src/decorators";

describe("Success", () => {
  test("Resolves the correct implementation when `container.get(AbstractClass)` is called directly", () => {
    abstract class Repository {}

    @Implements(Repository)
    class SqlRepository implements Repository {}

    const container = new Container();
    const repository = container.get(Repository);

    expect(repository).toBeInstanceOf(SqlRepository);
  });
});
