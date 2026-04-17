import { AnyConstructor } from "./types";

export class Container {
  constructor() {}

  get<T extends AnyConstructor>(dependency: T): InstanceType<T> {
    const implementation = Reflect.getMetadata("implements", dependency);
    if (implementation) return this.get(implementation);

    const injectable = Reflect.getMetadata("injectable", dependency);
    if (!injectable) {
      throw new Error(
        `Cannot resolve dependency ${dependency.name}. Make sure it is decorated with @Injectable().`,
      );
    }

    const params = Reflect.getMetadata("design:paramtypes", dependency);

    // @ts-ignore
    if (params === undefined) return new dependency();

    const dependencies = params.map((param: any) => this.get(param));

    // @ts-ignore
    return new dependency(...dependencies);
  }
}
