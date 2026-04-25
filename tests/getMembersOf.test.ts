import "reflect-metadata";
import { Abstract, RegisterAs } from "../src/decorators";
import { Container } from "../src/Container";

test("it should return all the members of an abstract class", () => {
  @Abstract()
  abstract class EventHandler {}

  @RegisterAs(EventHandler)
  class EventHandler1 implements EventHandler {}

  @RegisterAs(EventHandler)
  class EventHandler2 implements EventHandler {}

  const container = Container.create();
  const members = container.getMembersOf(EventHandler);

  expect(members[0]).toBe(EventHandler1);
  expect(members[1]).toBe(EventHandler2);
});

test("Should return empty array if the abstract class has no members", () => {
  @Abstract()
  abstract class EventHandler {}

  const container = Container.create();
  const members = container.getMembersOf(EventHandler);

  expect(members).toEqual([]);
});

test("Should throw error when trying to register a member to a non-abstract class", () => {
  class NotAbstract {}

  expect(() => {
    @RegisterAs(NotAbstract)
    class EventHandler1 implements NotAbstract {}
  }).toThrow(
    `EventHandler1 cannot be a member of NotAbstract. NotAbstract must be decorated with @Abstract() before it can have members`,
  );
});

test("Should throw error when trying to get members of a non-abstract class", () => {
  class NotAbstract {}

  const container = Container.create();

  expect(() => {
    container.getMembersOf(NotAbstract);
  }).toThrow(
    `Not abstract can't have members. NotAbstract must be decorated with @Abstract() before it can have members`,
  );
});
