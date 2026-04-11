import { Constructor } from "./types";

export function Injectable<T extends Constructor>(constructor: T) {}
