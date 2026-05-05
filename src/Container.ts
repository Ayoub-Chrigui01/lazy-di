import { scanFiles, ScannerOptions, ScanResult } from "./scanner";
import {
  IMPLEMENTS_SYMBOL,
  SCOPE_SYMBOL,
  INJECTABLE_SYMBOL,
  ABSTRACT_SYMBOL,
  MEMBERS_SYMBOL,
} from "./symbols";
import {
  AbstractConstructor,
  AnyConstructor,
  Constructor,
  Scope,
} from "./types";

export class Container {
  private singletons = new Map<Constructor, unknown>();
  private snapshotSingletons: Map<Constructor, unknown> | null = null;

  private constructor(
    private defaultScope: Scope,
    private parent: Container | null,
  ) {}

  static create(options?: { defaultScope?: Scope }): Container {
    return new Container(options?.defaultScope ?? "transient", null);
  }

  async scan(options: ScannerOptions): Promise<ScanResult> {
    return await scanFiles(options);
  }

  createChildContainer(): Container {
    return new Container(this.defaultScope, this);
  }

  get<T extends AnyConstructor>(dependency: T): InstanceType<T> {
    const isAbstract = !this.isConcrete(dependency);
    if (isAbstract) {
      const implementation = Reflect.getOwnMetadata(
        IMPLEMENTS_SYMBOL,
        dependency,
      );

      if (!implementation)
        throw new Error(
          `Cannot resolve dependency ${dependency.name}. No implementation found.`,
        );

      return this.get(implementation);
    }

    const cachedInstance = this.findInstanceInSingletons(dependency);
    if (cachedInstance !== undefined) return cachedInstance;

    const isInjectable = Reflect.getOwnMetadata(INJECTABLE_SYMBOL, dependency);
    if (!isInjectable)
      throw new Error(
        `Cannot resolve dependency ${dependency.name}. Make sure it is decorated with @Injectable().`,
      );

    const instance = this.initiateDependency(dependency);

    const dependencyScope: Scope =
      Reflect.getOwnMetadata(SCOPE_SYMBOL, dependency) ?? this.defaultScope;
    if (dependencyScope === "singleton")
      this.getRoot().singletons.set(dependency, instance);

    return instance;
  }

  bindToConstantValue<T extends Constructor>(
    dependency: T,
    value: InstanceType<T>,
  ): void {
    const scope = Reflect.getOwnMetadata(SCOPE_SYMBOL, dependency);
    if (scope === "transient")
      throw new Error(
        `Cannot bind dependency ${dependency.name} to a constant value. A dependency bound to a constant value cannot have an explicit transient scope.`,
      );

    this.singletons.set(dependency, value);
  }

  snapshot(): void {
    this.snapshotSingletons = new Map(this.singletons);
  }

  restore(): void {
    if (!this.snapshotSingletons)
      throw new Error("No snapshot found to restore");

    this.singletons = new Map(this.snapshotSingletons);
  }

  getMembersOf<T extends AbstractConstructor>(
    abstractClass: T,
  ): Constructor<InstanceType<T>>[] {
    const isAbstract = Reflect.getOwnMetadata(ABSTRACT_SYMBOL, abstractClass);
    if (!isAbstract)
      throw new Error(
        `Not abstract can't have members. ${abstractClass.name} must be decorated with @Abstract() before it can have members`,
      );

    const members = Reflect.getOwnMetadata(MEMBERS_SYMBOL, abstractClass);

    return members ?? [];
  }

  private findInstanceInSingletons<T extends Constructor>(
    dependency: T,
  ): InstanceType<T> | undefined {
    if (this.singletons.has(dependency))
      return this.singletons.get(dependency) as InstanceType<T>;

    if (this.parent) return this.parent.findInstanceInSingletons(dependency);

    return undefined;
  }

  private getRoot(): Container {
    return this.parent ? this.parent.getRoot() : this;
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
    return !Reflect.getOwnMetadata(ABSTRACT_SYMBOL, dependency);
  }
}
