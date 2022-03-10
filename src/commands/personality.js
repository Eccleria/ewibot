import personalities from "../jsons/personalities.json";

export var PERSONALITY = personalities.normal; // common var for all files

const action = (message) => {
  const args = message.content.toLowerCase().split(" ");
  const nameList = Object.keys(personalities); // List of all personalities names
  const replies = PERSONALITY.commands.personality;

  if (args.length === 1) {
    // If no content, send actual personality name
    message.reply(replies.currentName + PERSONALITY.name);
  } else if (args[1]) {
    if (nameList.includes(args[1])) {
      // If args[1] is in personalities.json
      PERSONALITY = Object.values(personalities).find(
        (obj) => obj.name === args[1]
      );
      message.reply(replies.change + `${args[1]}.`);
    } else if (args[1] === "list") {
      // Send  personality name list
      message.reply(replies.nameList + `${nameList.join(", ")}.`);
    } else message.reply(replies.nameError);
  }
};

const personality = {
  name: "personality",
  action,
  help: () => {
    return PERSONALITY.commands.personality.help;
  },
  admin: true,
};

export default personality;
