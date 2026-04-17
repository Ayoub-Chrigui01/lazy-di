import { AbstractConstructor, Constructor } from "./types";

export const Injectable =
  () =>
  <T extends Constructor>(constructor: T) => {};

export const Implements =
  <U extends AbstractConstructor>(a: U) =>
  <T extends Constructor<InstanceType<U>>>(constructor: T) => {
    Reflect.defineMetadata("implements", constructor, a);
  };
