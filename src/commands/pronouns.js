import { PERSONALITY } from "../personality.js";

const action = async (message, client) => {

};

const pronouns = {
  name: "pronouns",
  action,
  help: () => {
    return PERSONALITY.getCommands().pronouns.help;
  },
  admin: true,
};

export default pronouns;