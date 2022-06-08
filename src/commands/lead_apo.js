import { MessageEmbed } from "discord.js";
import { PERSONALITY } from "../personality.js";
import { removeAppologyCount } from "../helpers/index.js"

const action = async (message, client, _currentServer) => {
  const db = client.db;
  const dbData = db.data.apologiesCounting; //array of {userId, counter}

  //const sorted = mergeSort(dbData);
  const sorted = dbData.sort((a, b) => {
    if (a.counter < b.counter) {
      return -1;
    }
    if (a.counter > b.counter) {
      return 1;
    }
    return 0
  }); // sort users by counters

  //const filtered = sorted.filter((obj) => obj.counter > 9); //remove user with counter <= 9
  //assembler les données dans un embed
  //l'envoyer
  const guildMembers = message.guild.members;

  let texts = [{ name: "10-19", text: "" }, { name: "20-29", text: "" }, { name: ">29", text: "" }];

  for (const cur of sorted) {
    let guildMember;
    try {
      guildMember = await guildMembers.fetch(cur.userId); //get guildMember
    } catch {
      removeAppologyCount(cur.userId, db);
    }
    if (guildMember) {
      //console.log("guildMember", guildMember)
      const userNickname = guildMember.nickname || guildMember.user.username; //get nickname
      const nickSliced = userNickname.slice(20).padEnd(20, " ");
      const line = `${nickSliced} : ${cur.counter}`; // slice the name

      if (cur.counter < 20 && cur.counter >= 10)
        texts[0].text = `${texts[0].text}\n${line}`;
      if (cur.counter < 30 && cur.counter >= 20)
        texts[1].text = `${texts[1].text}\n${line}`;
      else texts[2].text = `${texts[2].text}\n${line}`;
    }
  }
  console.log("texts", texts);
  /*
  const embed = new MessageEmbed().setColor("ORANGE").setTimestamp(); //create embed
  //embed.addField('test', `${filtered[0].userId}: \t ${filtered[0].counter}`)
  message.reply({embeds: [embed]})
  */
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