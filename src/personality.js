// jsons imports
import { readFileSync } from "fs";
const personalities = JSON.parse(readFileSync("static/personalities.json"));

class Personality {
  /**
   * Constructor of the Personality class.
   * @param {string} name name of the personality, corresponding to personnalities.json names
   * @param {object} personality personality object related to the name.
   * @param {object} admin personality admin object, common for any personality.
   */
  constructor(name, personality, admin) {
    this.name = name;
    this.personality = personality;
    this.admin = admin;
  }

  /**
   * Allow to change the personality of the bot.
   * @param {string} name Name of the new personality.
   * @param {object} personality Personality object associated to the new personality.
   */
  set(name, personality) {
    this.name = name;
    this.personality = personality;
  }

  /** Allow to get the current personality object.
   * @returns {object} 
   */
  getPersonality() {
    return this.personality;
  }

  /** Allow to get the current personality name.
  * @returns {string}
  */
  getName() {
    return this.name;
  }

  /** Allow to get the current personality commands object.
  * @returns {object}
  */
  getCommands() {
    return this.personality.commands;
  }

  /** Allow to get the current personality spotify object.
  * @returns {object}
  */
  getSpotify() {
    return this.personality.spotify;
  }

  /** Allow to get the global personality admin object.
  * @returns {object}
  */
  getAdmin() {
    return this.admin;
  }
}

//initiating Personality for the bot with init values.
export const PERSONALITY = new Personality(
  "normal",
  personalities.normal,
  personalities.admin
);

// coming soon, but not today

// const action = (message) => {
//   const args = message.content.toLowerCase().split(" ");
//   const nameList = Object.keys(personalities); // List of all personalities names
//   const replies = PERSONALITY.getCommands().personality;
//
//   if (args.length === 1) {
//     // If no content, send actual personality name
//     message.reply(replies.currentName + PERSONALITY.getName() + ".");
//   } else if (args[1]) {
//     if (nameList.includes(args[1])) {
//       // If args[1] is in personalities.json
//       const foundPersonality = Object.values(personalities).find(
//         (obj) => obj.name === args[1]
//       );
//       if (foundPersonality) {
//         PERSONALITY.set(foundPersonality.name, foundPersonality);
//         message.reply(replies.change + `${args[1]}.`);
//       }
//     } else if (args[1] === "list") {
//       // Send  personality name list
//       message.reply(replies.nameList + `${nameList.join(", ")}.`);
//     } else message.reply(replies.nameError);
//   }
// };
//
// const personality = {
//   name: "personality",
//   action,
//   help: () => {
//     return PERSONALITY.getCommands().personality.help;
//   },
//   admin: true,
// };
//
// export default personality;
