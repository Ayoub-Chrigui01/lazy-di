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

test("It should scan with rootDir as an array", async () => {
  const container = Container.create();
  const result = await container.scan({
    rootDir: [join(__dirname, "fixtures")],
  });
  expect(result.filesFound).toBeGreaterThan(0);
});

test("It should scan with exclude as a string", async () => {
  const container = Container.create();
  const result = await container.scan({
    rootDir: join(__dirname, "fixtures"),
    exclude: "**/*.nonexistent",
  });
  expect(result.filesFound).toBeGreaterThan(0);
});

test("It should scan with exclude as an array", async () => {
  const container = Container.create();
  const result = await container.scan({
    rootDir: join(__dirname, "fixtures"),
    exclude: ["**/*.nonexistent"],
  });
  expect(result.filesFound).toBeGreaterThan(0);
});
