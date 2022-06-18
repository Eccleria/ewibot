import { MessageActionRow, MessageButton } from "discord.js";
import { PERSONALITY } from "../personality.js";

const action = async (message, client) => {
  const { content } = message;
  const args = content.toLowerCase().split(" ");

  //personality
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns;

  //create all buttons
  const style = "SECONDARY";
  const row1 = new MessageActionRow().addComponents(
    createButton("he", pronounsP.he, style),
    createButton("she", pronounsP.she, style),
    createButton("they", pronounsP.they, style),
    createButton("ael", pronounsP.ael, style),
    createButton("askP", pronounsP.askP, style)
  );
  const row2 = new MessageActionRow().addComponents(
    createButton("no", pronounsP.no, style),
    createButton("all", pronounsP.all, style),
  );
  const rowsPronouns = [row1, row2];

  const rowAgreement = new MessageActionRow().addComponents(
    createButton("male", pronounsP.male, style),
    createButton("neutral", pronounsP.neutral, style),
    createButton("female", pronounsP.female, style),
    createButton("askA", pronounsP.askA, style),
  );

  //message.reply({components: [row1, row2, row3]})
  //send messages
};

const createButton = (id, label, style) => {
  return new MessageButton()
    .setCustomId(id)
    .setLabel(label)
    .setStyle(style);
}

const pronouns = {
  name: "pronouns",
  action,
  help: () => {
    return PERSONALITY.getCommands().pronouns.help;
  },
  admin: true,
};

export default pronouns;
