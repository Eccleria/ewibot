// jsons imports
import { readFileSync } from "fs";
const path = "static/personalities/";
const admin = JSON.parse(readFileSync(path + "admin.json"));
const announces = JSON.parse(readFileSync(path + "announces.json"));
const personalities = JSON.parse(readFileSync(path + "personalities.json"));
const colors = JSON.parse(readFileSync("static/colors.json"));

//export var PERSONALITY = personalities.normal; // common var for all files

class Personality {
  constructor(name, personality, admin, announces, colors) {
    this.name = name;
    this.personality = personality;
    this.admin = admin;
    this.announces = announces;
    this.colors = colors;
  }

  set(name, personality) {
    this.name = name;
    this.personality = personality;
  }
  getPersonality() {
    return this.personality;
  }
  getName() {
    return this.name;
  }
  getCommands() {
    return this.personality.commands;
  }
  getSpotify() {
    return this.personality.spotify;
  }
  getAdmin() {
    return this.admin;
  }
  getAnnounces() {
    return this.announces;
  }
  getColors() {
    return this.colors;
  }
}

export const PERSONALITY = new Personality(
  "normal",
  personalities.normal,
  admin,
  announces,
  colors
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
