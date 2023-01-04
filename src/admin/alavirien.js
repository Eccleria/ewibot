import dayjs from "dayjs";

import { removeAlavirien } from "../helpers/index.js"
import { setupEmbed, finishEmbed } from "./utils.js";
import { isSentinelle } from "../commands/utils.js";
import { PERSONALITY } from "../personality.js";

export const presentationHandler = async (server, messageReaction, author) => {
  const client = messageReaction.client;
  const personality = PERSONALITY.getAdmin().alavirien;

  const guild = await client.guilds.fetch(messageReaction.message.guildId);
  const member = await guild.members.fetch(author.id);

  if (isSentinelle(member, server)) {
    console.log("isSentinelle reaction")
    giveAlavirien(client, server, personality, author.id);
  }
};

const giveAlavirien = async (client, server, personality, userId) => {
  //fetch data
  const guild = await client.guilds.fetch(server.guildId);
  const guildMember = await guild.members.fetch(userId);
  const logChannel = await client.channels.fetch(server.logChannelId); //get logChannel

  if (!guildMember.roles.cache.has(server.alavirienRoleId)) {
    //if doesn't have the role
    guildMember.roles.add(server.alavirienRoleId); //add role
    removeAlavirien(client.db, userId); //remove from db

    //send log
    const embed = setupEmbed("DARK_GREY", personality, guildMember.user, "tag"); //create log
    finishEmbed(personality, `<@${process.env.CLIENTID}>`, embed, logChannel); //send
  }
};

const checkAlavirien = async (client, server) => {
  //function to check every alavirien in db if they meet the requirements
  console.log("Alavirien check");

  const db = client.db;
  const dbUsers = db.data.alavirien;
  console.log("alavirien dbUsers", dbUsers);
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
      giveAlavirien(client, server, alavirien, userId);
    }
    //if doesn't respect requirements, nothing to do
  })
}

export const setupAlavirien = async (client, commons, tomorrow, frequency) => {
  //init everyday Alavirien 
  const timeToTomorrow = tomorrow.minute(5).diff(dayjs()); //time to tommorow in ms

  setTimeout(async () => {
    //timeout until tomorrow

    const server = commons.find(({ name }) =>
      process.env.DEBUG === "yes" ? name === "test" : name === "prod"
    ); //get server data
    checkAlavirien(client, server); //check for alavirien role attribution

    setInterval(() => checkAlavirien, frequency, client, server)
  }, timeToTomorrow);
}
