// json import
import { readFileSync } from "fs";
const eventCommons = JSON.parse(readFileSync("src/commands/eventRoles/eventCommons.json"));

class EventCommons {
  constructor(commons) {
    this.commons = commons;
  }

  /**
   * Get event roles data for each guild
   * @returns commons 
   */
  getCommons() {
    return this.commons;
  }
  /**
   * Add event role data to eventCommons.json file
   * @param {string} guildId Guild id of the new role 
   * @param {string} roleName Name of the new event role
   * @param {string} roleId Id of the new event role
   */
  addRole(guildId, roleName, roleId) {
    const guildCommon = this.commons.find((obj) => obj.guildId === guildId);
    guildCommon[`${roleName}RoleId`] = roleId;
  }
}

export const EVENTCOMMONS = new EventCommons(eventCommons);
