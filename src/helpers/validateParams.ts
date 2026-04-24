import { Constructor } from "../types";

const UNRESOLVABLE_TOKENS = new Set<unknown>([
  // Primitives
  Object,
  String,
  Number,
  Boolean,
  Symbol,
  BigInt,
  Function,
  // Collections
  Array,
  Map,
  Set,
  WeakMap,
  WeakSet,
  // Other built-ins
  Date,
  RegExp,
  Promise,
  Error,
]);

export function validateParamTypes(target: Constructor): void {
  const paramTypes: unknown[] =
    Reflect.getMetadata("design:paramtypes", target) ?? [];

  for (let i = 0; i < paramTypes.length; i++) {
    const token = paramTypes[i];

    if (token === undefined) {
      throw new Error(
        `[${target.name}] cannot be registered: parameter at index ${i} has no type metadata.
          This usually means a circular import. Check your imports for cycles.`,
      );
    }

    if (UNRESOLVABLE_TOKENS.has(token)) {
      const tokenName = (token as { name?: string }).name ?? String(token);
      throw new Error(
        `[${target.name}] cannot be registered: parameter at index ${i} resolved to '${tokenName}' at runtime.
Interfaces, type aliases, 'any', 'unknown', and primitives are erased by TypeScript — use an abstract class instead.`,
      );
    }
  }
}
