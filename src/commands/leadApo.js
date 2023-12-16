import { Colors, EmbedBuilder } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";
import { interactionEditReply } from "./polls/pollsUtils.js";
import {
  interactionReply,
  isAdmin,
  removeApologyCount,
} from "../helpers/index.js";
import { PERSONALITY } from "../personality.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().leaderboardApology.name)
  .setDescription(PERSONALITY.getCommands().leaderboardApology.description)
  .setDefaultMemberPermissions(0x0000010000000000);

const action = async (interaction) => {
  await interaction.deferReply({ ephemeral: true });
  const perso = PERSONALITY.getCommands().leaderboardApology;

  if (!isAdmin(interaction.user.id)) {
    console.log(`${interaction.user.id} tryed to use /leadApo`);
    interactionEditReply(interaction, perso.errorNotAllowed);
    return;
  }

  const client = interaction.client;
  const db = client.db;
  const dbData = db.data.apologiesCounting; //array of {userId, counter}

  interaction.channel.sendTyping();

  const sorted = dbData.sort((a, b) => a.counter - b.counter); // sort users by counters
  console.log("sorted", sorted);

  const guildMembers = interaction.guild.members;
  const baseValue = "```\n";
  let fields = [
    { name: "10-75", value: baseValue, max: 75, min: 10 },
    { name: "76-150", value: baseValue, max: 150, min: 76 },
    { name: ">150", value: baseValue, max: -1, min: 151 },
    { name: "top 3", value: baseValue },
  ]; //initiate future embed fields

  let count = 0;
  for (const cur of sorted) {
    //for every user, write in the rigth place

    let guildMember;
    try {
      guildMember = await guildMembers.fetch(cur.userId); //get guildMember
    } catch {
      //if not found, not in serveur anymore => remove from db
      removeApologyCount(db, cur.userId);
    }

    if (guildMember && cur.counter >= 10) {
      //if found && enough apologies
      console.log(
        "nickname",
        guildMember.nickname,
        "username",
        guildMember.user.username,
        "counter",
        cur.counter
      );
      const userNickname = guildMember.nickname
        ? guildMember.nickname
        : guildMember.user.username; //get nickname
      const nickSliced = userNickname.slice(0, 25).padEnd(25, " ");
      const line = `${nickSliced}: ${cur.counter}`; // add count to the line

      //separate data
      if (count >= sorted.length - 3) {
        //if top3
        fields[fields.length - 1].value = `${
          fields[fields.length - 1].value
        }${line}\n`;
      } else {
        const isInRange = fields
          .slice(0, fields.length - 1)
          .reduce((acc, fld) => {
            if (fld.max === -1) return [...acc, fld.min <= cur.counter];
            else
              return [...acc, fld.min <= cur.counter && cur.counter <= fld.max];
          }, []); //find which field where counter is in range, return bool
        const idx = isInRange.findIndex((bool) => bool); //get field index where value is true
        if (idx !== -1) fields[idx].value = `${fields[idx].value}${line}\n`; //update field for any idx correct value
      }
    }
    count = count + 1; //for find top3
  }

  fields.forEach((cur) => (cur.value = cur.value + "```"));

  //build embed
  const ePerso = perso.embed; //get embed personality
  const embed = new EmbedBuilder() //create embed
    .setColor(Colors.Orange)
    .setTimestamp()
    .setTitle(ePerso.title)
    .setDescription(ePerso.description)
    .addFields(fields.slice(0, 3))
    .addFields({
      name: fields[3].name,
      value: `${ePerso.top3} ${fields[3].value}`,
    });

  const message = await interaction.channel.send({ embeds: [embed] });
  if (message) interactionEditReply(interaction, perso.sent);
  else interactionEditReply(interaction, perso.errorNotSent);
};

const leaderboardApology = {
  command,
  name: "leadApo",
  action,
  help: (interaction) => {
    const perso = PERSONALITY.getCommands().leaderboardApology;
    interactionReply(interaction, perso.help);
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default leaderboardApology;
