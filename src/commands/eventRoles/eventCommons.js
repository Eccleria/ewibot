import { Low, JSONFile } from "lowdb";
const adapter = new JSONFile("src/commands/eventRoles/eventCommons.json");
const common = new Low(adapter);
common.read(); // Read data from JSON file, this will set common.data content

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
  async addRole(guildId, roleName, roleId) {
    const guildCommon = this.commons.find((obj) => obj.guildId === guildId);
    guildCommon[`${roleName}RoleId`] = roleId;
    
    console.log("this.commons", this.commons)
    await common.write();
    console.log("common", common)
  }
}

export const EVENTCOMMONS = new EventCommons(eventCommons);
