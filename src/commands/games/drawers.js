import { ActionRowBuilder, ButtonStyle } from "discord.js";
import { createButton } from "../utils.js";
import { interactionReply } from "../../helpers/index.js";
import { COMMONS } from "../../commons.js";
import { PERSONALITY } from "../../personality.js";

export const drawerCreativityAction = async (interaction) => {
  const perso = PERSONALITY.getCommands().games.drawer.creativity;
  const options = interaction.options;

  //get options
  const target = options.getUser(perso.userOption.name);
  const customTheme = options.getString(perso.customOption.name);
  const choiceTheme = options.getString(perso.choiceOption.name);

  //check for target
  /*
  if (target.id === interaction.user.id || target.id === process.env.CLIENTID) {
    interactionReply(interaction, perso.errorWrongTarget);
    return;
  }
  */

  //check for theme error
  if (!customTheme && !choiceTheme) {
    interactionReply(interaction, perso.errorNoTheme);
    return;
  }
  const theme = customTheme ? customTheme : choiceTheme;

  //create defi message with content + button
  const bPerso = perso.buttons;
  const confirmButton = createButton(...bPerso.confirm, ButtonStyle.Primary);
  const denyButton = createButton(...bPerso.deny, ButtonStyle.Danger);
  const ActionRow = new ActionRowBuilder().addComponents(
    confirmButton,
    denyButton,
  );

  const content =
    interaction.member.toString() +
    perso.message[0] +
    target.toString() +
    perso.message[1] +
    theme;
  const server = COMMONS.fetchFromGuildId(interaction.guildId);
  const channel = await interaction.guild.channels.fetch(
    server.randomfloodChannelId,
  );
  if (channel) {
    try {
      const message = channel.send({ components: [ActionRow], content });
      if (message) interactionReply(interaction, perso.sent);
      else interactionReply(interaction, perso.errorNotSent);
    } catch (e) {
      console.log("games drawer creativity send error", e);
      return;
    }
  }
};
