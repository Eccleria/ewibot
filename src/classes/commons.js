// jsons import
import { readFileSync } from "fs";
import { Commons } from "ewilib";
const commons = JSON.parse(readFileSync("static/commons.json"));

Commons.prototype.fetchFromEnv = function() {
  return isProduction ? this._prod : this._test;
}

//Unique instance of Commons class, used in all files
export const COMMONS = new Commons(commons.test, commons.prod, commons.shared);
