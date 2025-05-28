import { SlashCommandBuilder } from "@discordjs/builders";
import {
  ActionRowBuilder,
  EmbedBuilder,
  ButtonStyle,
  Colors,
  MessageFlags,
} from "discord.js";
import { createButton } from "./utils.js";
import { interactionReply, isAdmin } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";

// GIFT Announce
const giftAction = async (interaction) => {
  //action to fire once correct button is clicked
  const personality = PERSONALITY.getAnnounces().announce_gift;
  interactionReply(interaction, personality.sending);

  //create announce
  const fields = personality.fields;
  const embed = new EmbedBuilder()
    .setColor(Colors.DarkGreen)
    .setTimestamp()
    .setTitle(personality.title)
    .setDescription(personality.description)
    .setFooter({
      text: personality.footer,
      iconURL:
        "https://cdn.discordapp.com/avatars/691336942117453876/6d73900209e4d3bc35039f68f4aa9789.webp",
    })
    .addFields(Object.values(fields))
    .setThumbnail(
      "https://media.discordapp.net/attachments/959815577575256124/1041070360461852724/Ewilan_writing_cut.png?width=670&height=670",
    );

  //get channel
  const server = COMMONS.fetchFromGuildId(interaction.guildId);
  const channelId = server.announce.giftChannelId;
  const channel = await interaction.client.channels.fetch(channelId);

  //send gift announce
  channel.send({ embeds: [embed] });
};

const giftAnnounce = {
  action: giftAction,
  button: {
    name: "gift",
    value: "announce_gift",
  },
};

// ANNOUNCE

//announce action
const action = (interaction) => {
  // handle announce command interaction

  const announceP = PERSONALITY.getPersonality().announce; //get personality

  if (!isAdmin(interaction.user.id)) {
    //check for admin
    interactionReply(interaction, announceP.notAdmin);
    return;
  }

  //get interaction data
  //const client = interaction.client;
  const options = interaction.options;
  const whichAnnounce = options.getString(announceP.stringOption.name);
  const whichAnnounceP = PERSONALITY.getAnnounces()[whichAnnounce];
  //create confirm button
  const actionRow = new ActionRowBuilder().addComponents(
    createButton(whichAnnounceP.id, announceP.buttonLabel, ButtonStyle.Danger),
  );

  interaction.reply({
    content: whichAnnounceP.confirm,
    components: [actionRow],
    flags: MessageFlags.Ephemeral,
  });
};

//list of announces
const announces = [giftAnnounce]; //list of all announces

//button action dispatcher
export const announceButtonHandler = (interaction) => {
  const whichButton = interaction.customId;
  const foundAnnounce = announces.find(
    (obj) => obj.button.value === whichButton,
  );

  if (foundAnnounce) foundAnnounce.action(interaction);
  else
    interactionReply(interaction, PERSONALITY.getPersonality().announce.notFound);
};

//announce command
const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getPersonality().announce.name)
  .setDescription(PERSONALITY.getPersonality().announce.description)
  .setDefaultMemberPermissions(0x0000010000000000)
  .addStringOption((option) =>
    option
      .setName(PERSONALITY.getPersonality().announce.stringOption.name)
      .setDescription(
        PERSONALITY.getPersonality().announce.stringOption.description,
      )
      .addChoices(...announces.map((obj) => obj.button)),
  );

const announce = {
  action,
  command,
  help: (interaction) => {
    interactionReply(interaction, PERSONALITY.getPersonality().announce.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default announce;
