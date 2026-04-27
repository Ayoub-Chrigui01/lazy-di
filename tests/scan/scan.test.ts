import "reflect-metadata";
import { Container } from "../../src/Container";
import { Service } from "./fixtures/services/Service";
import { join } from "path";

test("It should scan and import the files", async () => {
  const container = Container.create();

  await container.scan({
    rootDir: join(__dirname, "fixtures"),
  });

  const service = container.get(Service);

  expect(service).toBeInstanceOf(Service);
});
