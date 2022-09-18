//import { MessageEmbed } from "discord.js";
import { SlashCommandBuilder } from "@discordjs/builders"

import { interactionReply } from "./utils.js";
import { addStatsUser, isStatsUser, removeStatsUser } from "../helpers/index.js";

import { PERSONALITY } from "../personality.js";

const action = async (interaction) => { //, client) => {
  const options = interaction.options; //get interaction options
  const subcommand = options.getSubcommand();
  const db = interaction.client.db;

  const perso = PERSONALITY.getCommands(); //get personality
  const useP = perso.stats.use;

  if (subcommand === "use") {
    const userId = interaction.member.id;
    if (isStatsUser(userId, db)) {
      //if already user, remove
      removeStatsUser(userId, db);
      interactionReply(interaction, useP.isNotUser);
    } else {
      //if not user, add
      addStatsUser(userId, db);
      interactionReply(interaction, useP.isUser);
    }
    return;
  }
  //if (words.length > 1 && words[1] === "leadApo") leadApo(message, client);
};

/*
const leadApo = async (message, client) => {
  const db = client.db;
  const dbData = db.data.stats; //array of {userId, counter}

  message.channel.sendTyping();

  const sorted = dbData.sort((a, b) => a.apologies - b.apologies); // sort users by counters

  const guildMembers = message.guild.members;

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
      removeStatsUser(cur.userId, db);
    }

    if (guildMember && cur.apologies >= 10) {
      //if found && enough apologies
      const userNickname = guildMember.nickname || guildMember.user.username; //get nickname
      const nickSliced = userNickname.slice(0, 25).padEnd(25, " ");
      const line = `${nickSliced}: ${cur.apologies}`; // add count to the line

      //separate data
      if (cur.apologies < 20) fields[0].value = `${fields[0].value}${line}\n`;
      else if (cur.apologies < 30)
        fields[1].value = `${fields[1].value}${line}\n`;
      else if (count >= sorted.length - 3) {
        //if top3
        fields[3].value = `${fields[3].value}${line}\n`;
      } else fields[2].value = `${fields[2].value}${line}\n`;
    }
    count = count + 1; //for find top3
  }

  fields.forEach((cur) => (cur.value = cur.value + "```"));

  //get personality
  const personality = PERSONALITY.getCommands();
  const leadApo = personality.leaderboardApology;

  const embed = new MessageEmbed() //create embed
    .setColor("ORANGE")
    .setTimestamp()
    .setTitle(leadApo.title)
    .setDescription(leadApo.description)
    .addFields(fields.slice(0, 3))
    .addField(fields[3].name, `${leadApo.top3} ${fields[3].value}`);

  message.reply({ embeds: [embed] });
};

const stats = {
  name: "stats",
  action,
  help: () => {
    return PERSONALITY.getCommands().stats.help;
  },
  admin: true,
};
*/

const command = new SlashCommandBuilder()
  .setName("stats")
  .setDescription("regroups all commands associated to stats")
  .addSubcommand((command) =>
    command
      .setName("use")
      .setDescription("Si vous voulez avoir des stats sur vous.")
  );

const stats = {
  command,
  action,
  help: (interaction) => {
    const personality = PERSONALITY.getCommands().stats;
    interactionReply(interaction, personality.help);
  }
};

export default stats;
