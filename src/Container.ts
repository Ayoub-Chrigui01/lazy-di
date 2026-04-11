import { Constructor } from "./types";

export class Container {
  constructor() {}

  get<T extends Constructor>(dependency: T): InstanceType<T> {
    console.log("resolving", dependency);

    const params = Reflect.getMetadata("design:paramtypes", dependency);

    if (params === undefined) return new dependency();

    const dependencies = params.map((param: any) => this.get(param));

    return new dependency(...dependencies);
  }
}
