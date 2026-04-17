import { AbstractConstructor, Constructor } from "./types";

export const Injectable =
  () =>
  <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata("injectable", true, constructor);
  };

export const Implements =
  <U extends AbstractConstructor>(abstractClass: U) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    const isAbstract = Reflect.getMetadata("abstract", abstractClass);
    if (!isAbstract)
      throw new Error(
        `${abstractClass.name} must be decorated with @Abstract() before it can be implemented by another class.`,
      );

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
