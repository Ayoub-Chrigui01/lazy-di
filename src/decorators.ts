import { ensureReflectMetadataIsLoaded } from "./helpers/reflectMetadata";
import { validateParamTypes } from "./helpers/validateParams";
import {
  IMPLEMENTS_SYMBOL,
  ABSTRACT_SYMBOL,
  INJECTABLE_SYMBOL,
  SCOPE_SYMBOL,
  MEMBERS_SYMBOL,
} from "./symbols";
import { AbstractConstructor, Constructor, Scope } from "./types";

export const Injectable =
  ({ scope }: { scope?: Scope } = {}) =>
  <T extends Constructor>(constructor: T) => {
    ensureReflectMetadataIsLoaded();

    validateParamTypes(constructor);

    Reflect.defineMetadata(INJECTABLE_SYMBOL, true, constructor);
    if (scope) Reflect.defineMetadata(SCOPE_SYMBOL, scope, constructor);
  };

export const Implements =
  <U extends AbstractConstructor>(
    abstractClass: U,
    options?: { when?: boolean },
  ) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    const isAbstract = Reflect.getOwnMetadata(ABSTRACT_SYMBOL, abstractClass);
    if (!isAbstract)
      throw new Error(
        `${abstractClass.name} must be decorated with @Abstract() before it can be implemented by another class.`,
      );

    if (options?.when === false) return;

    const implementation = Reflect.getOwnMetadata(
      IMPLEMENTS_SYMBOL,
      abstractClass,
    );
    if (implementation)
      throw new Error(
        `${constructor.name} cannot implement ${abstractClass.name}. ${abstractClass.name} is already implemented by ${implementation.name}.`,
      );

    Reflect.defineMetadata(IMPLEMENTS_SYMBOL, constructor, abstractClass);
  };

export const Abstract =
  () =>
  <T extends AbstractConstructor>(constructor: T) => {
    ensureReflectMetadataIsLoaded();

    Reflect.defineMetadata(ABSTRACT_SYMBOL, true, constructor);
  };

export const RegisterAs =
  <U extends AbstractConstructor>(abstractClass: U) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    const isAbstract = Reflect.getOwnMetadata(ABSTRACT_SYMBOL, abstractClass);
    if (!isAbstract)
      throw new Error(
        `${constructor.name} cannot be a member of ${abstractClass.name}. ${abstractClass.name} must be decorated with @Abstract() before it can have members`,
      );

    const members = Reflect.getOwnMetadata(MEMBERS_SYMBOL, abstractClass) ?? [];
    Reflect.defineMetadata(
      MEMBERS_SYMBOL,
      [...members, constructor],
      abstractClass,
    );
  };
