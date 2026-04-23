import { AnyConstructor, Constructor } from "./types";

export class Container {
  constructor() {}

  get<T extends AnyConstructor>(dependency: T): InstanceType<T> {
    if (!this.isConcrete(dependency)) {
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

    if (params === undefined) return new dependency();

    const dependencies = params.map((param: any) => this.get(param));

    return new dependency(...dependencies);
  }

  private isConcrete<T>(
    dependency: AnyConstructor<T>,
  ): dependency is Constructor<T> {
    return !Reflect.getMetadata("abstract", dependency);
  }
}
