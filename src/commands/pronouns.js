import { MessageActionRow, MessageButton } from "discord.js";
import { PERSONALITY } from "../personality.js";

import { setupEmbed } from "../admin/utils.js";

const action = async (message, client, currentServer) => {
  const { pronounsRoleHandleChannelId } = currentServer;
  const guild = await client.guilds.fetch(message.guildId);
  const roleChannel = await guild.channels.fetch(pronounsRoleHandleChannelId);

  //personality
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns.pronouns;
  const agreements = personality.pronouns.agreements;

  //create all buttons
  const style = "SECONDARY"; //grey background
  const rowP1 = new MessageActionRow().addComponents(
    createButton("he", pronounsP.he, style),
    createButton("she", pronounsP.she, style),
    createButton("they", pronounsP.they, style),
    createButton("ael", pronounsP.ael, style),
    createButton("askP", pronounsP.ask, style)
  );
  const rowP2 = new MessageActionRow().addComponents(
    createButton("no", pronounsP.no, style),
    createButton("allP", pronounsP.all, style),
    createButton("cancelP", pronounsP.cancel, "DANGER") //red background
  );
  const rowsPronouns = [rowP1, rowP2];

  const rowA1 = new MessageActionRow().addComponents(
    createButton("male", agreements.male, style),
    createButton("neutral", agreements.neutral, style),
    createButton("female", agreements.female, style),
    createButton("askA", agreements.ask, style),
    createButton("allA", agreements.all, style) 
  );
  const rowA2 = new MessageActionRow().addComponents(
    createButton("cancelA", agreements.cancel, "DANGER") //red background
  );
  const rowAgreement = [rowA1, rowA2];

  //create embeds;
  const embedPronouns = setupEmbed("ORANGE", pronounsP, null, "skip");
  const embedAgreements = setupEmbed("ORANGE", agreements, null, "skip");

  //send messages
  await roleChannel.send({ embeds: [embedPronouns], components: rowsPronouns });
  await roleChannel.send({
    embeds: [embedAgreements],
    components: [rowAgreement],
  });
};

const createButton = (id, label, style) => {
  return new MessageButton().setCustomId(id).setLabel(label).setStyle(style);
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
