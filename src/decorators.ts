import { validateParamTypes } from "./helpers/validateParams";
import { AbstractConstructor, Constructor, Scope } from "./types";

export const Injectable =
  ({ scope }: { scope?: Scope } = {}) =>
  <T extends Constructor>(constructor: T) => {
    if (typeof Reflect.getMetadata !== "function")
      throw new Error(
        "reflect-metadata is not loaded. Import it at the entry point of your application before anything else.",
      );

    validateParamTypes(constructor);

    Reflect.defineMetadata("injectable", true, constructor);
    if (scope) Reflect.defineMetadata("scope", scope, constructor);
  };

export const Implements =
  <U extends AbstractConstructor>(
    abstractClass: U,
    options?: { when?: boolean },
  ) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    const isAbstract = Reflect.getMetadata("abstract", abstractClass);
    if (!isAbstract)
      throw new Error(
        `${abstractClass.name} must be decorated with @Abstract() before it can be implemented by another class.`,
      );

    if (options?.when === false) return;

    const implementation = Reflect.getMetadata("implements", abstractClass);
    if (implementation)
      throw new Error(
        `${constructor.name} cannot implement ${abstractClass.name}. ${abstractClass.name} is already implemented by ${implementation.name}.`,
      );

    Reflect.defineMetadata("implements", constructor, abstractClass);
  };

export const Abstract =
  () =>
  <T extends AbstractConstructor>(constructor: T) => {
    Reflect.defineMetadata("abstract", true, constructor);
  };
