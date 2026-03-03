// jsons import
import { readFileSync } from "fs";
const commons = JSON.parse(readFileSync("static/commons.json"));

/**
 * Class giving access to commons.json data for all bot files
 */
class Commons {
  constructor(test, prod, shared) {
    this._test = test;
    this._prod = prod;
    this._shared = shared;
  }

  /**
   * get Test server values
   * @returns {object} specific values for test server
   */
  getTest() {
    return this._test;
  }

  /**
   * get Prod server values
   * @returns {object} specific values for prod server
   */
  getProd() {
    return this._prod;
  }

  /**
   * get Shared values for both servers
   * @returns {object} values shared for both servers
   */
  getShared() {
    return this._shared;
  }

  /**
   * get correct commons.json data, according to given guildId
   * @param {string} guildId Guild id
   * @returns {object} specific values for prod or test server
   */
  fetchFromGuildId(guildId) {
    return this.getList().find((obj) => guildId === obj.guildId);
  }
  /**
   * get both test & prod values in a list
   * @returns {object} Both test, prod object in a list
   */
  getList() {
    return [this._test, this._prod];
  }
}

//Unique instance of Commons class, used in all files
export const COMMONS = new Commons(commons.test, commons.prod, commons.shared);
