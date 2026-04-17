import { AnyConstructor } from "./types";

export class Container {
  constructor() {}

  get<T extends AnyConstructor>(dependency: T): InstanceType<T> {
    const isAbstract = Reflect.getMetadata("abstract", dependency);
    if (isAbstract) {
      const implementation = Reflect.getMetadata("implements", dependency);

      if (!implementation)
        throw new Error(
          `Cannot resolve dependency ${dependency.name}. No implementation found.`,
        );

      return this.get(implementation);
    }

    const isInjectable = Reflect.getMetadata("injectable", dependency);
    if (!isInjectable)
      throw new Error(
        `Cannot resolve dependency ${dependency.name}. Make sure it is decorated with @Injectable().`,
      );

    const params = Reflect.getMetadata("design:paramtypes", dependency);

    // @ts-ignore
    if (params === undefined) return new dependency();

    const dependencies = params.map((param: any) => this.get(param));

    // @ts-ignore
    return new dependency(...dependencies);
  }
}
