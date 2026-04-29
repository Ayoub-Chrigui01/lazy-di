import "reflect-metadata";
import { Container, Injectable } from "../src";

test("should restore singletons that were resolved before the snapshot", () => {
  @Injectable({
    scope: "singleton",
  })
  class Repo {}

  const container = Container.create();
  const repo = container.get(Repo);

  container.snapshot();
  container.restore();

  const repo2 = container.get(Repo);
  expect(repo).toBe(repo2);
});

test("should drop singletons that were resolved after the snapshot", () => {
  @Injectable({
    scope: "singleton",
  })
  class Repo {}

  const container = Container.create();
  container.snapshot();

  const repo1 = container.get(Repo);

  container.restore();

  const repo2 = container.get(Repo);
  const repo3 = container.get(Repo);

  expect(repo2).toBe(repo3);
  expect(repo1).not.toBe(repo2);
  expect(repo1).not.toBe(repo3);
});

test("should allow multiple restores from the same snapshot", () => {
  @Injectable({
    scope: "singleton",
  })
  class Repo {}

  @Injectable({
    scope: "singleton",
  })
  class Service {}

  const container = Container.create();
  const repo1 = container.get(Repo);

  container.snapshot();
  const service1 = container.get(Service);
  container.restore();

  const repo2 = container.get(Repo);
  expect(repo1).toBe(repo2);
  const service2 = container.get(Service);
  expect(service1).not.toBe(service2);
  container.restore();

  const repo3 = container.get(Repo);
  expect(repo1).toBe(repo3);
  const service3 = container.get(Service);
  expect(service1).not.toBe(service3);
  expect(service2).not.toBe(service3);
});

test("should throw when restore is called without a prior snapshot", () => {
  const container = Container.create();
  expect(() => container.restore()).toThrow("No snapshot found to restore");
});
