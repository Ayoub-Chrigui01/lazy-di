import "reflect-metadata";
import { Container } from "../src/Container";
import { Abstract, Implements, Injectable } from "../src/decorators";

test("When no default scope is provided, default scope is `transient`", () => {
  @Injectable()
  class ServiceA {}

  const container = new Container();
  const instance1 = container.get(ServiceA);
  const instance2 = container.get(ServiceA);

  expect(instance1).toBeInstanceOf(ServiceA);
  expect(instance2).toBeInstanceOf(ServiceA);
  expect(instance1).not.toBe(instance2);
});

describe("When default scope is set to `singleton`", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container({
      defaultScope: "singleton",
    });
  });

  test("Dependency with no explicit scope is resolved as singleton", () => {
    @Injectable()
    class ServiceA {}

    const instance1 = container.get(ServiceA);
    const instance2 = container.get(ServiceA);

    expect(instance1).toBeInstanceOf(ServiceA);
    expect(instance2).toBeInstanceOf(ServiceA);
    expect(instance1).toBe(instance2);
  });

  test("Dependency with explicit transient scope is resolved as transient", () => {
    @Injectable({
      scope: "transient",
    })
    class ServiceA {}

    const instance1 = container.get(ServiceA);
    const instance2 = container.get(ServiceA);

    expect(instance1).toBeInstanceOf(ServiceA);
    expect(instance2).toBeInstanceOf(ServiceA);
    expect(instance1).not.toBe(instance2);
  });
});

describe("When default scope is set to `transient`", () => {
  let container: Container;

  beforeEach(() => {
    container = new Container({
      defaultScope: "transient",
    });
  });

  test("Dependency with no explicit scope is resolved as transient", () => {
    @Injectable()
    class ServiceA {}

    const instance1 = container.get(ServiceA);
    const instance2 = container.get(ServiceA);

    expect(instance1).toBeInstanceOf(ServiceA);
    expect(instance2).toBeInstanceOf(ServiceA);
    expect(instance1).not.toBe(instance2);
  });

  test("Dependency with explicit singleton scope is resolved as singleton", () => {
    @Injectable({
      scope: "singleton",
    })
    class ServiceA {}

    const instance1 = container.get(ServiceA);
    const instance2 = container.get(ServiceA);

    expect(instance1).toBeInstanceOf(ServiceA);
    expect(instance2).toBeInstanceOf(ServiceA);
    expect(instance1).toBe(instance2);
  });
});

describe("Abstract classes", () => {
  test("When concrete class is singleton, resolving abstract class multiple times should return the same instance", () => {
    @Abstract()
    abstract class Repo {}

    @Injectable({
      scope: "singleton",
    })
    @Implements(Repo)
    class SqlRepo implements Repo {}

    const container = new Container();
    const instance1 = container.get(Repo);
    const instance2 = container.get(Repo);

    expect(instance1).toBeInstanceOf(SqlRepo);
    expect(instance2).toBeInstanceOf(SqlRepo);
    expect(instance1).toBe(instance2);
  });

  test("When concrete class is transient, resolving abstract class multiple times should return different instances", () => {
    @Abstract()
    abstract class Repo {}

    @Injectable({
      scope: "transient",
    })
    @Implements(Repo)
    class SqlRepo implements Repo {}

    const container = new Container();
    const instance1 = container.get(Repo);
    const instance2 = container.get(Repo);

    expect(instance1).toBeInstanceOf(SqlRepo);
    expect(instance2).toBeInstanceOf(SqlRepo);
    expect(instance1).not.toBe(instance2);
  });
});

test("Two separate singleton containers should not share instances", () => {
  @Injectable({
    scope: "singleton",
  })
  class ServiceA {}

  const container1 = new Container();
  const container2 = new Container();

  const instance1 = container1.get(ServiceA);
  const instance2 = container2.get(ServiceA);

  expect(instance1).toBeInstanceOf(ServiceA);
  expect(instance2).toBeInstanceOf(ServiceA);
  expect(instance1).not.toBe(instance2);
});
