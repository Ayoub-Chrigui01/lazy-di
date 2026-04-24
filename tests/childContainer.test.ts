import "reflect-metadata";
import { Container } from "../src/Container";
import { Injectable } from "../src/decorators";

test("should return the parent singleton when only the parent has a cached instance", () => {
  @Injectable({
    scope: "singleton",
  })
  class Service {}

  const container = Container.create();
  const service = container.get(Service);

  const childContainer = container.createChildContainer();
  const childService = childContainer.get(Service);

  expect(childService).toBe(service);
});

test("should return the child singleton when both parent and child have a cached instance", () => {
  @Injectable({
    scope: "singleton",
  })
  class Service {}

  const container = Container.create();
  const parentService = container.get(Service);

  const createdService = new Service();

  const childContainer = container.createChildContainer();
  childContainer.bindToConstantValue(Service, createdService);

  const childService = childContainer.get(Service);

  expect(childService).toBe(createdService);
  expect(childService).not.toBe(parentService);
});

test("should store the new instance in the parent when neither has a cached instance", () => {
  @Injectable({
    scope: "singleton",
  })
  class Service {}

  const container = Container.create();
  const childContainer = container.createChildContainer();
  const childService = childContainer.get(Service);
  const parentService = container.get(Service);

  expect(parentService).toBe(childService);
});

test("should return a new instance on every call for transient dependencies", () => {
  @Injectable({
    scope: "transient",
  })
  class Service {}

  const container = Container.create();
  const childContainer = container.createChildContainer();

  const service1 = childContainer.get(Service);
  const service2 = childContainer.get(Service);
  const service3 = container.get(Service);

  expect(service1).not.toBe(service2);
  expect(service1).not.toBe(service3);
  expect(service2).not.toBe(service3);
});

test("Request made to child container must check container singletons for nested parents as well", () => {
  @Injectable()
  class DBConnection {}

  @Injectable()
  class SqlRepository {
    constructor(public dbConnection: DBConnection) {}
  }

  @Injectable()
  class Service {
    constructor(public repository: SqlRepository) {}
  }

  const container = Container.create();
  const childContainer = container.createChildContainer();

  const dbConnection = new DBConnection();
  childContainer.bindToConstantValue(DBConnection, dbConnection);

  const service = childContainer.get(Service);
  expect(service.repository.dbConnection).toBe(dbConnection);
});

test("should search in parent singletons all the way up to the root", () => {
  @Injectable({
    scope: "singleton",
  })
  class Service {}

  const rootContainer = Container.create();
  const rootService = rootContainer.get(Service);

  const childContainer = rootContainer.createChildContainer();
  const grandChildContainer = childContainer.createChildContainer();

  const service = grandChildContainer.get(Service);
  expect(service).toBe(rootService);
});
