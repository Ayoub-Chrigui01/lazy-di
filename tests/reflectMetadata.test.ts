import { Abstract, Injectable } from "../src/decorators";

test("When reflect-metadata is not imported @Injectable should throw an error", () => {
  expect(() => {
    @Injectable()
    class Service {}
  }).toThrow(
    "reflect-metadata is not loaded. Import it at the entry point of your application before anything else.",
  );
});

test("When reflect-metadata is not imported @Abstract should throw an error", () => {
  expect(() => {
    @Abstract()
    class Service {}
  }).toThrow(
    "reflect-metadata is not loaded. Import it at the entry point of your application before anything else.",
  );
});
