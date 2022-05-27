import dayjs from "dayjs";

import { removeAlavirien } from "../helpers/index.js"
import { setupEmbed, finishEmbed } from "./utils.js";
import { PERSONALITY } from "../personality.js";

export const checkAlavirien = async (client, server, logChannel) => {
  const db = client.db;

  const dbUsers = db.data.alavirien;
  if (!dbUsers) return;

  //get personality
  const personality = PERSONALITY.getAdmin(); //get personality
  const alavirien = personality.alavirien;

  const today = dayjs();
  dbUsers.forEach(async (cur) => {
    //{ userId: authorId, messageNumber: number, joinAt: date}
    const { userId, messageNumber, joinAt } = cur
    const day = dayjs(joinAt);
    const deltaT = today.diff(day); //diff between joining date and now in ms

    //check if 1 week + 20 messages
    const isOneWeek = deltaT > 604800000; // 1week = 7*24*3600*1000 ms
    const is20Messages = messageNumber >= 20; 
    if (isOneWeek && is20Messages) {
      //get GuildMember
      const guild = await client.guilds.fetch(server.guildId);
      const guildMember = await guild.members.fetch(userId);
      //console.log(guildMember);

      guildMember.roles.add(server.alavirienRoleId); //add role
      removeAlavirien(db, userId); //remove from db

      //send log
      const embed = setupEmbed("DARK_GREY", alavirien, guildMember.user, "tag");
      await finishEmbed(alavirien, `<@${process.env.CLIENTID}>`, embed, logChannel);
    }
  })
}