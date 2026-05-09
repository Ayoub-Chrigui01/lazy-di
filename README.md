# lazy-di

[![npm version](https://img.shields.io/npm/v/@lazy-di/core)](https://www.npmjs.com/package/@lazy-di/core)
[![npm downloads](https://img.shields.io/npm/dm/@lazy-di/core)](https://www.npmjs.com/package/@lazy-di/core)
[![CI](https://github.com/Ayoub-Chrigui01/lazy-di/actions/workflows/ci.yml/badge.svg)](https://github.com/Ayoub-Chrigui01/lazy-di/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

**Zero-ceremony dependency injection for TypeScript.**

No manual bindings. No string tokens. Just decorate your classes and resolve.

```typescript
@Injectable()
class Database {
  query(sql: string) { ... }
}

@Injectable()
class UserRepository {
  constructor(private db: Database) {}
}

const container = Container.create();
const repo = container.get(UserRepository); // Database injected automatically
```

---

## Why Lazy-di

Most TypeScript DI containers make you maintain a separate binding file where you map tokens to implementations. As your application grows, this file becomes a source of merge conflicts, cognitive overhead, and ceremony that adds no business value.

Lazy-di eliminates that file entirely. Dependencies are registered automatically through decorators, and resolved using class constructors as tokens — no strings, no Symbols, no manual wiring.

|                       | Lazy-di | InversifyJS | tsyringe | TypeDI |
| --------------------- | ------- | ----------- | -------- | ------ |
| Manual binding file   | ✗       | ✓           | ✓        | ✓      |
| String/Symbol tokens  | ✗       | ✓           | ✓        | ✓      |
| Abstract class tokens | ✓       | ✗           | ✗        | ✗      |
| Conditional binding   | ✓       | ✗           | ✗        | ✗      |
| Collection injection  | ✓       | partial     | ✗        | ✗      |
| Child containers      | ✓       | ✓           | ✗        | ✗      |

---

## Installation

```bash
npm install @lazy-di/core reflect-metadata
```

`reflect-metadata` is a peer dependency. It must be imported **once**, as the **first line** of your application entry point:

```typescript
// main.ts — must be first
import "reflect-metadata";
import { Container } from "@lazy-di/core";
```

### tsconfig requirements

```json
{
  "compilerOptions": {
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true
  }
}
```

Both options are required. Without `emitDecoratorMetadata`, TypeScript does not emit constructor parameter type information at runtime, and injection cannot work.

---

## Core concepts

### `@Injectable()`

Marks a class as resolvable by the container. The container reads constructor parameter types at runtime and resolves them recursively.

```typescript
@Injectable()
class MailService {
  send(to: string, subject: string) { ... }
}

@Injectable()
class NotificationService {
  constructor(private mail: MailService) {}

  notify(user: User) {
    this.mail.send(user.email, 'You have a new notification');
  }
}
```

Classes without `@Injectable()` cannot be resolved — the container throws a descriptive error if you attempt to resolve one.

### Scopes

Lazy-di supports two scopes:

- **`transient`** (default) — a new instance is created on every `container.get()` call
- **`singleton`** — one instance is created per root container and reused for all subsequent calls

```typescript
@Injectable({ scope: "singleton" })
class DatabaseConnection {
  constructor() {
    // expensive setup — only runs once
  }
}

@Injectable() // transient by default
class RequestHandler {
  constructor(private db: DatabaseConnection) {}
}
```

You can also set the default scope at the container level:

```typescript
const container = Container.create({ defaultScope: "singleton" });
```

Class-level scope always takes precedence over the container default.

---

## Abstract classes as tokens

Interfaces are erased at runtime — they cannot be used as injection tokens. Lazy-di solves this with abstract classes decorated with `@Abstract()`, which provides both a compile-time type contract and a runtime identity.

```typescript
@Abstract()
abstract class PaymentGateway {
  abstract charge(amount: number, currency: string): Promise<void>;
}

@Injectable()
@Implements(PaymentGateway)
class StripeGateway extends PaymentGateway {
  async charge(amount: number, currency: string) {
    // Stripe implementation
  }
}

@Injectable()
class OrderService {
  constructor(private gateway: PaymentGateway) {}
  //                           ^ resolves to StripeGateway automatically
}
```

`@Abstract()` marks the abstract class as a valid token. `@Implements()` registers the concrete class as its implementation. When the container resolves `PaymentGateway`, it transparently returns a `StripeGateway` instance.

### Conditional binding

`@Implements()` accepts a `when` option for environment or context-driven binding:

```typescript
@Injectable()
@Implements(PaymentGateway, { when: process.env.NODE_ENV !== 'test' })
class StripeGateway extends PaymentGateway { ... }

@Injectable()
@Implements(PaymentGateway, { when: process.env.NODE_ENV === 'test' })
class MockGateway extends PaymentGateway { ... }
```

When `when` evaluates to `false`, the decorator is a no-op — the class is not registered as an implementation.

---

## Collection injection

When multiple classes share the same abstract class, use `@RegisterAs()` to register them as a collection, then retrieve all members with `getMembersOf()`.

```typescript
@Abstract()
abstract class EventHandler {
  abstract handle(event: DomainEvent): void;
}

@Injectable()
@RegisterAs(EventHandler)
class SendEmailOnUserRegistered extends EventHandler { ... }

@Injectable()
@RegisterAs(EventHandler)
class CreateAuditLogOnUserRegistered extends EventHandler { ... }

// Dispatch to all handlers
const handlers = container.getMembersOf(EventHandler);
for (const Handler of handlers) {
  container.get(Handler).handle(event);
}
```

`getMembersOf()` returns an array of constructors. You resolve each one individually, respecting their individual scopes.

---

## Child containers

Child containers inherit singletons from their parent but maintain their own scope. This is useful for isolating dependencies per request in a server context.

```typescript
const root = Container.create({ defaultScope: "singleton" });

// Per-request
const child = root.createChildContainer();
const handler = child.get(RequestHandler);
```

Singleton instances created in the root are shared across all child containers. Instances created in a child are scoped to that child.

---

## Binding to a constant value

For testing or for injecting pre-constructed instances, use `bindToConstantValue()`:

```typescript
const container = Container.create();

const mockGateway = new MockPaymentGateway();
container.bindToConstantValue(PaymentGateway, mockGateway);

// container.get(PaymentGateway) now returns mockGateway
```

A class bound to a constant value cannot have an explicit `transient` scope — constant values are by definition stable references.

---

## Auto-discovery

In large projects, manually importing every file to trigger decorator registration is impractical. Lazy-di provides a file scanner that dynamically imports all TypeScript files under a given directory at startup:

```typescript
import "reflect-metadata";
import { Container } from "@lazy-di/core";

const container = Container.create();

const result = await container.scan({ rootDir: "src" });

// All @Injectable classes under src/ are now registered
const app = container.get(App);
```

### `ScanResult`

| Field           | Type     | Description                         |
| --------------- | -------- | ----------------------------------- |
| `filesFound`    | `number` | Total files matched under `rootDir` |
| `filesImported` | `number` | Files successfully imported         |
| `filesSkipped`  | `number` | Files skipped due to import errors  |
| `durationMs`    | `number` | Total scan duration in milliseconds |

---

## Error messages

Lazy-di throws descriptive errors at the point of misconfiguration, not silently at runtime.

| Scenario                                        | Error                                                                                                                                           |
| ----------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| `reflect-metadata` not loaded                   | `reflect-metadata is not loaded. Add import 'reflect-metadata' as the first line of your entry point.`                                          |
| `emitDecoratorMetadata` not enabled             | `No metadata found for "MyClass". Ensure emitDecoratorMetadata is true in your tsconfig and that the class has at least one decorator applied.` |
| Resolving non-injectable class                  | `Cannot resolve dependency MyClass. Make sure it is decorated with @Injectable().`                                                              |
| Resolving abstract class with no implementation | `Cannot resolve dependency PaymentGateway. No implementation found.`                                                                            |
| Duplicate `@Implements` registration            | `StripeGateway cannot implement PaymentGateway. PaymentGateway is already implemented by AnotherGateway.`                                       |
| `@Implements` on non-abstract class             | `PaymentGateway must be decorated with @Abstract() before it can be implemented by another class.`                                              |
| `bindToConstantValue` on transient class        | `Cannot bind MyClass to a constant value. A dependency bound to a constant value cannot have an explicit transient scope.`                      |

---

## Full API reference

### `Container`

| Method                                        | Description                                                                           |
| --------------------------------------------- | ------------------------------------------------------------------------------------- |
| `Container.create(options?)`                  | Creates a new root container. Accepts `{ defaultScope }`.                             |
| `container.get(token)`                        | Resolves a dependency. Accepts a concrete class or an `@Abstract()` class.            |
| `container.scan(options)`                     | Dynamically imports all files under `options.rootDir`.                                |
| `container.createChildContainer()`            | Creates a child container that inherits singletons from the parent.                   |
| `container.bindToConstantValue(token, value)` | Binds a class to a pre-constructed instance.                                          |
| `container.getMembersOf(abstractClass)`       | Returns all constructors registered via `@RegisterAs()` for the given abstract class. |

### Decorators

| Decorator                               | Target         | Description                                                      |
| --------------------------------------- | -------------- | ---------------------------------------------------------------- |
| `@Injectable({ scope? })`               | Concrete class | Marks the class as resolvable. Scope is `transient` by default.  |
| `@Abstract()`                           | Abstract class | Marks the class as a valid injection token.                      |
| `@Implements(AbstractClass, { when? })` | Concrete class | Registers the class as the implementation of an abstract class.  |
| `@RegisterAs(AbstractClass)`            | Concrete class | Registers the class as a member of an abstract class collection. |

---

## License

MIT
