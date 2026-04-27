import { ensureReflectMetadataIsLoaded } from "./helpers/reflectMetadata";
import { validateParamTypes } from "./helpers/validateParams";
import { AbstractConstructor, Constructor, Scope } from "./types";

export const Injectable =
  ({ scope }: { scope?: Scope } = {}) =>
  <T extends Constructor>(constructor: T) => {
    ensureReflectMetadataIsLoaded();

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
    ensureReflectMetadataIsLoaded();

    Reflect.defineMetadata("abstract", true, constructor);
  };

export const RegisterAs =
  <U extends AbstractConstructor>(abstractClass: U) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    const isAbstract = Reflect.getMetadata("abstract", abstractClass);
    if (!isAbstract)
      throw new Error(
        `${constructor.name} cannot be a member of ${abstractClass.name}. ${abstractClass.name} must be decorated with @Abstract() before it can have members`,
      );

    const members = Reflect.getMetadata("members", abstractClass) ?? [];
    Reflect.defineMetadata("members", [...members, constructor], abstractClass);
  };
