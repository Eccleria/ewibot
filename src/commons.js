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
    return this.shared;
  }
  fetchFromGuildId(guildId) {
    return this.list.find((obj) => guildId === obj.guildId);
  }
  getList() {
    return [this.test, this.prod];
  }
}

export const COMMONS = new Commons(commons.test, commons.prod, commons.shared);
