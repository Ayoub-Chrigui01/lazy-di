import "reflect-metadata";
import { Container } from "./Container";
import { Injectable } from "./decorator";

@Injectable
class Dependency2 {
  c = 3;
  constructor() {}
}

@Injectable
class Dependency1 {
  b = 2;
  constructor(public dependency2: Dependency2) {}
}

@Injectable
class Ayoub {
  a = 1;

  constructor(public dependency1: Dependency1) {}

  log() {
    console.log(this.a);
    console.log(this.dependency1.b);
    console.log(this.dependency1.dependency2.c);
  }
}

const container = new Container();

const ayoub = container.get(Ayoub);

ayoub.log();
