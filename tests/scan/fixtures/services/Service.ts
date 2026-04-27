import { Injectable } from "../../../../src/decorators";
import { Repo } from "../repos/Repo";

@Injectable()
export class Service {
  constructor(private repo: Repo) {}
}
