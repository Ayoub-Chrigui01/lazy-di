import { Implements, Injectable } from "../../../../src/decorators";
import { Logger } from "../Logger";
import { Repo } from "./Repo";

@Injectable()
@Implements(Repo)
export class SqlRepo implements Repo {
  constructor(private logger: Logger) {}
}
