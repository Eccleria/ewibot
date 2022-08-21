import { SlashCommandBuilder } from "@discordjs/builders";

// jsons imports
import { readFileSync } from "fs";
const personalities = JSON.parse(readFileSync("static/personalities.json"));

/** Get a list of personality names.
 * @returns {string[]}
 */
const getPersonalityNames = () => {
  const nameList = Object.keys(personalities); // list of all personalities names
  const filtered = nameList.filter((str) => str !== "admin");
  return filtered;
};

/** Create the choices of the personality command.
 * @returns {object[]}
 */
const commandChoices = () => {
  const nameList = getPersonalityNames();
  const result = nameList.reduce((acc, cur) => {
    return [...acc, { name: cur, value: cur }];
  }, []);

  return result;
};

const command = new SlashCommandBuilder()
  .setName("personality")
  .setDescription("Changement de personnalité du bot.")
  .addStringOption((option) =>
    option
      .setName("personality")
      .setDescription("Nom de la personnalité à utiliser.")
      .addChoices(...commandChoices())
  );

const action = (message) => {
  const args = message.content.tolowercase().split(" ");
  const nameList = getPersonalityNames();
  const replies = personality.getcommands().personality;

  if (args.length === 1) {
    // if no content, send actual personality name
    message.reply(replies.currentname + personality.getname() + ".");
  } else if (args[1]) {
    if (nameList.includes(args[1])) {
      // if args[1] is in personalities.json
      const foundpersonality = Object.values(personalities).find(
        (obj) => obj.name === args[1]
      );
      if (foundpersonality) {
        personality.set(foundpersonality.name, foundpersonality);
        message.reply(replies.change + `${args[1]}.`);
      }
    } else if (args[1] === "list") {
      // send  personality name list
      message.reply(replies.namelist + `${nameList.join(", ")}.`);
    } else message.reply(replies.nameerror);
  }
};

const personality = {
  name: "personality",
  command,
  action,
  help: () => {
    return personality.getcommands().personality.help;
  },
  admin: true,
};

export default personality;
