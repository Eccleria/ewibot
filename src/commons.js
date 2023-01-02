// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

class Commons {
  constructor(test, prod, shared) {
    this.test = test;
    this.prod = prod;
    this.shared = shared;
  }

  getTest() {
    return this.test;
  }
  getProd() {
    return this.prod;
  }
  getShared() {
    return this.personality.shared;
  }
};

export const COMMONS = new Commons(commons.test, commons.prod, commons.shared);
