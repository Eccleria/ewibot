import { MessageEmbed } from "discord.js";
import { PERSONALITY } from "../personality.js";
import { removeAppologyCount } from "../helpers/index.js";

const action = async (message, client) => {
  const db = client.db;
  const dbData = db.data.apologiesCounting; //array of {userId, counter}

  const sorted = dbData.sort((a, b) => {
    if (a.counter < b.counter) {
      return -1;
    }
    if (a.counter > b.counter) {
      return 1;
    }
    return 0;
  }); // sort users by counters

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
      removeAppologyCount(cur.userId, db);
    }

    if (guildMember && cur.counter >= 10) {
      //if found && enough apologies
      const userNickname = guildMember.nickname || guildMember.user.username; //get nickname
      const length = userNickname.length;
      const nickSliced =
        length > 15
          ? userNickname.slice(15)
          : userNickname + " ".repeat(15 - length); // slice the name, no more than 15 characters
      const line = `${nickSliced}: ${cur.counter}`; // add count to the line

      //separate data
      if (cur.counter < 20) fields[0].value = `${fields[0].value}${line}\n`;
      else if (cur.counter < 30)
        fields[1].value = `${fields[1].value}${line}\n`;
      else if (count >= sorted.length - 3) { //if top3
        fields[3].value = `${fields[3].value}${line}\n`;
      } else fields[2].value = `${fields[2].value}${line}\n`;
    }
    count = count + 1; //for find top3
  }

  fields.map((cur) => (cur.value = cur.value + "```"));

  //get personality
  const personality = PERSONALITY.getCommands();
  const lead_apo = personality.leaderboard_apology;

  const embed = new MessageEmbed() //create embed
    .setColor("ORANGE")
    .setTimestamp() 
    .setTitle(lead_apo.title)
    .setDescription(lead_apo.description)
    .addFields(fields.slice(0, 3))
    .addField(fields[3].name, `${lead_apo.top3} ${fields[3].value}`);

  message.reply({ embeds: [embed] });
};

const leaderboard_apology = {
  name: "lead_apo",
  action,
  help: () => {
    return PERSONALITY.getCommands().leaderboard_apology.help;
  },
  admin: true,
};

export default leaderboard_apology;
