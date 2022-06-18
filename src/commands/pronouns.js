import { MessageActionRow, MessageButton } from 'discord.js';
import { PERSONALITY } from "../personality.js";

const action = async (message, client) => {
  const { content } = message;
  const args = content.toLowerCase().split(" ");

  //personality
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns;
  //create all buttons

  /*pronom
- il
- elle
- iel
- æl
- demandez
- pas de pronom
- tout pronom

accords :
- masculins
- neutres
- féminins
- demandez*/
  const style = "SECONDARY";
  const row1 = new MessageActionRow()
    .addComponents(
      new MessageButton().setCustomId("il").setLabel(pronounsP.he).setStyle(style),
      new MessageButton().setCustomId("elle").setLabel(pronounsP.she).setStyle(style),
      new MessageButton().setCustomId("iel").setLabel(pronounsP.they).setStyle(style),
      new MessageButton().setCustomId("æl").setLabel(pronounsP.ael).setStyle(style),
      new MessageButton().setCustomId("askP").setLabel(pronounsP.ask).setStyle(style),
  );
  const row2 = new MessageActionRow()
    .addComponents(
      new MessageButton().setCustomId("no").setLabel(pronounsP.no).setStyle(style),
      new MessageButton().setCustomId("all").setLabel(pronounsP.all).setStyle(style),
  );
  const rowsPronouns = [row1, row2];

  const rowAgreement = new MessageActionRow()
    .addComponents(
      new MessageButton().setCustomId("male").setLabel(pronounsP.male).setStyle(style),
      new MessageButton().setCustomId("neutral").setLabel(pronounsP.neutral).setStyle(style),
      new MessageButton().setCustomId("female").setLabel(pronounsP.female).setStyle(style),
      new MessageButton().setCustomId("askA").setLabel(pronounsP.ask).setStyle(style),
  );

  //message.reply({components: [row1, row2, row3]})
  //send messages
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