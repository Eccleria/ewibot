// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

class Commons {
  constructor(test, prod, shared) {
    this.test = test;
    this.prod = prod;
    this.shared = shared;
    this.list = [this.test, this.prod];
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
  fetchGuildId(guildId) {
    return this.list.find((obj) => guildId === obj.guildId);
  }
};

export const COMMONS = new Commons(commons.test, commons.prod, commons.shared);
