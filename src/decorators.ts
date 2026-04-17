import { AbstractConstructor, Constructor } from "./types";

export const Injectable =
  () =>
  <T extends Constructor>(constructor: T) => {
    Reflect.defineMetadata("injectable", true, constructor);
  };

export const Implements =
  <U extends AbstractConstructor>(a: U) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    Reflect.defineMetadata("implements", constructor, a);
  };
