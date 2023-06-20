import { MessageActionRow, ButtonStyle } from "discord.js";
import { PERSONALITY } from "../personality.js";

import { setupEmbed } from "../admin/utils.js";
import { createButton } from "./utils.js";

const action = async (message, _client, currentServer) => {
  const { pronounsRoleHandleChannelId } = currentServer;
  const guild = await message.client.guilds.fetch(message.guildId);
  const roleChannel = await guild.channels.fetch(pronounsRoleHandleChannelId);

  //personality
  const personality = PERSONALITY.getCommands();
  const pronounsP = personality.pronouns.pronouns;
  const agreements = personality.pronouns.agreements;

  //create all buttons
  const style = ButtonStyle.Secondary; //grey background
  const base = personality.pronouns.baseId;
  const rowP1 = new MessageActionRow().addComponents(
    createButton(base + "he", pronounsP.he, style),
    createButton(base + "she", pronounsP.she, style),
    createButton(base + "they", pronounsP.they, style),
    createButton(base + "ael", pronounsP.ael, style),
    createButton(base + "askP", pronounsP.ask, style)
  );
  const rowP2 = new MessageActionRow().addComponents(
    createButton(base + "no", pronounsP.no, style),
    createButton(base + "allP", pronounsP.all, style),
    createButton(base + "cancelP", pronounsP.cancel, ButtonStyle.Danger) //red background
  );
  const rowsPronouns = [rowP1, rowP2];

  const rowA1 = new MessageActionRow().addComponents(
    createButton(base + "male", agreements.male, style),
    createButton(base + "neutral", agreements.neutral, style),
    createButton(base + "female", agreements.female, style),
    createButton(base + "askA", agreements.ask, style),
    createButton(base + "allA", agreements.all, style)
  );
  const rowA2 = new MessageActionRow().addComponents(
    createButton(base + "cancelA", agreements.cancel, ButtonStyle.Danger) //red background
  );
  const rowAgreement = [rowA1, rowA2];

  //create embeds;
  const embedPronouns = setupEmbed("ORANGE", pronounsP, null, "skip");
  const embedAgreements = setupEmbed("ORANGE", agreements, null, "skip");

  //send messages
  await roleChannel.send({ embeds: [embedPronouns], components: rowsPronouns });
  await roleChannel.send({
    embeds: [embedAgreements],
    components: rowAgreement,
  });
};

const pronouns = {
  name: "pronouns",
  action,
  help: () => {
    return PERSONALITY.getCommands().pronouns.help;
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default pronouns;
