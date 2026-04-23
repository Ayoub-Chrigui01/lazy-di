import { AnyConstructor, Constructor, Scope } from "./types";

export class Container {
  private defaultScope: Scope;
  private singletons = new Map<Constructor, unknown>();

  constructor({ defaultScope = "transient" }: { defaultScope?: Scope } = {}) {
    this.defaultScope = defaultScope;
  }

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

    const dependencyScope: Scope =
      Reflect.getMetadata("scope", dependency) || this.defaultScope;

    if (dependencyScope === "singleton") {
      if (this.singletons.has(dependency))
        return this.singletons.get(dependency) as InstanceType<T>;

      const instance = this.initiateDependency(dependency);
      this.singletons.set(dependency, instance);
      return instance;
    }

    const instance = this.initiateDependency(dependency);
    return instance;
  }

  private initiateDependency<T extends Constructor>(
    dependency: T,
  ): InstanceType<T> {
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
