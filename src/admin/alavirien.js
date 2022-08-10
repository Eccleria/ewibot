import dayjs from "dayjs";

import { removeAlavirien } from "../helpers/index.js"
import { setupEmbed, finishEmbed } from "./utils.js";
import { PERSONALITY } from "../personality.js";

const checkAlavirien = async (client, server, logChannel) => {
  //function to check every alavirien in db if they meet the requirements

  const db = client.db;
  const dbUsers = db.data.alavirien;
  if (!dbUsers) return; //if no data in db, nothing to do

  //get personality
  const personality = PERSONALITY.getAdmin(); //get personality
  const alavirien = personality.alavirien;

  const today = dayjs(); //get today date

  dbUsers.forEach(async (cur) => {
    //db data format : { userId: authorId, messageNumber: number, joinAt: date}
    const { userId, messageNumber, joinAt } = cur
    const day = dayjs(joinAt);
    const deltaT = today.diff(day); //diff between joining date and now in ms

    //check if 1 week + 20 messages : alavirien requirement
    const isOneWeek = deltaT > 604800000; // 1week = 7*24*3600*1000 ms
    const is20Messages = messageNumber >= 20; 
    if (isOneWeek && is20Messages) {
      //get GuildMember
      const guild = await client.guilds.fetch(server.guildId);
      const guildMember = await guild.members.fetch(userId);

      guildMember.roles.add(server.alavirienRoleId); //add role
      removeAlavirien(db, userId); //remove from db

      //send log
      const embed = setupEmbed("DARK_GREY", alavirien, guildMember.user, "tag"); //create log
      await finishEmbed(alavirien, `<@${process.env.CLIENTID}>`, embed, logChannel); //send
    }
    //if doesn't respect requirements, nothing to do
  })
}

export const setupAlavirien = async (client, commons, tomorrow, frequency) => {
  //init everyday Alavirien 
  const timeToTomorrow = tomorrow.minute(5).diff(dayjs()); //time to tommorow in ms

  setTimeout(async () => {
    //timeout until tomorrow
    console.log("Alavirien check");

    //get checkAlavirien args
    const server = commons.find(({ name }) =>
      process.env.DEBUG === "yes" ? name === "test" : name === "prod"
    ); //get server data
    const logChannel = await client.channels.fetch(server.logChannelId); //get logChannel
    checkAlavirien(client, server, logChannel); //check for alavirien role attribution

    setInterval(() => checkAlavirien, frequency, client, server, logChannel)
  }, timeToTomorrow);
}
