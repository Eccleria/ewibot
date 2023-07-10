import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders";

import { PERSONALITY } from "../personality.js";
import { isAdmin, removeApologyCount } from "../helpers/index.js";
import { interactionReply } from "./utils.js";

const command = new SlashCommandBuilder()
  .setName(PERSONALITY.getCommands().leaderboardApology.name)
  .setDescription(PERSONALITY.getCommands().leaderboardApology.description)
  .setDefaultMemberPermissions(0x0000010000000000);


const action = async (interaction) => {
  const perso = PERSONALITY.getCommands().leaderboardApology;

  if (!isAdmin(interaction.user.id)) {
    console.log(`${interaction.user.id} tryed to use /leadApo`);
    interactionReply(interaction, perso.errorNotAllowed);
    return;
  }

  const client = interaction.client;
  const db = client.db;
  const dbData = db.data.apologiesCounting; //array of {userId, counter}

  interaction.channel.sendTyping();

  const sorted = dbData.sort((a, b) => a.counter - b.counter); // sort users by counters
  console.log("sorted", sorted);

  const guildMembers = interaction.guild.members;

  let fields = [
    { name: "10-19", value: "```md\n" },
    { name: "20-29", value: "```md\n" },
    { name: ">29", value: "```md\n" },
    { name: "top 3", value: "```md\n" },
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
      console.log("nickname", guildMember.nickname, "username", guildMember.user.username)
      const userNickname = guildMember.nickname ? guildMember.nickname : guildMember.user.username; //get nickname
      const nickSliced = userNickname.slice(0, 25).padEnd(25, " ");
      const line = `${nickSliced}: ${cur.counter}`; // add count to the line

      //separate data
      if (count >= sorted.length - 3) {
        //if top3
        fields[3].value = `${fields[3].value}${line}\n`;
      }
      else if (cur.counter < 20) fields[0].value = `${fields[0].value}${line}\n`;
      else if (cur.counter < 30)
        fields[1].value = `${fields[1].value}${line}\n`;
      else fields[2].value = `${fields[2].value}${line}\n`;
    }
    count = count + 1; //for find top3
  }

  fields.forEach((cur) => (cur.value = cur.value + "```"));

  //build embed
  const ePerso = perso.embed; //get embed personality
  const embed = new MessageEmbed() //create embed
    .setColor("ORANGE")
    .setTimestamp()
    .setTitle(ePerso.title)
    .setDescription(ePerso.description)
    .addFields(fields.slice(0, 3))
    .addFields({name: fields[3].name, value: `${ePerso.top3} ${fields[3].value}`});

  interaction.channel.send({ embeds: [embed] });
};

const leaderboardApology = {
  command,
  name: "leadApo",
  action,
  help: () => {
    return PERSONALITY.getCommands().leaderboardApology.help;
  },
  admin: true,
  releaseDate: null,
  sentinelle: true,
};

export default leaderboardApology;
