import { Constructor } from "./types";

export class Container {
  constructor() {}

  get<T extends Constructor>(dependency: T): InstanceType<T> {
    const params = Reflect.getMetadata("design:paramtypes", dependency);
    const numberOfConstructorParams = dependency.length;

    if (params === undefined && numberOfConstructorParams > 0) {
      throw new Error(
        `Cannot resolve dependency ${dependency.name}. Make sure it is decorated with @Injectable.`,
      );
    }

    if (params === undefined) return new dependency();

    const dependencies = params.map((param: any) => this.get(param));

    return new dependency(...dependencies);
  }
}
