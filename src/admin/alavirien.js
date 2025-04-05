import dayjs from "dayjs";
import { finishEmbed } from "./utils.js";
import { isSentinelle, removeAlavirien, setupEmbed } from "../helpers/index.js";
import { COMMONS } from "../commons.js";
import { PERSONALITY } from "../personality.js";
import { Colors } from "discord.js";

export const presentationHandler = async (
  server,
  messageReaction,
  reactingUser,
) => {
  const client = messageReaction.client;
  const personality = PERSONALITY.getAdmin().alavirien;

  //fetch message if too old to be cached
  const { message } = messageReaction;
  const fetchedMessage = await message.fetch();

  //fetch reactingMember for role check
  const guild = await client.guilds.fetch(fetchedMessage.guildId);
  const reactingMember = await guild.members.fetch(reactingUser.id);

  if (isSentinelle(reactingMember, server)) {
    console.log("isSentinelle reaction");
    giveAlavirien(client, server, personality, fetchedMessage.author.id);
  }
};

const giveAlavirien = async (client, server, personality, userId) => {
  //fetch data
  const guild = await client.guilds.fetch(server.guildId);

  let guildMember;
  try {
    guildMember = await guild.members.fetch(userId);
  } catch (e) {
    console.log("Alavirien - unknown guildMember ", userId, e);
    removeAlavirien(client.db, userId); //remove from db
    return;
  }

  const logChannel = await client.channels.fetch(server.logChannelId); //get logChannel

  if (!guildMember.roles.cache.has(server.alavirienRoleId)) {
    //if doesn't have the role
    guildMember.roles.add(server.alavirienRoleId); //add role
    removeAlavirien(client.db, userId); //remove from db

    //send log
    const color = Colors.DarkGrey;
    const embed = setupEmbed(color, personality, guildMember.user, "tag"); //create log
    finishEmbed(
      personality,
      `<@${process.env.CLIENTID}>`,
      embed,
      false,
      logChannel,
    ); //send
  }
};

const checkAlavirien = async (client, server) => {
  //function to check every alavirien in db if they meet the requirements
  console.log("Alavirien check");

  //get db data
  const db = client.db;
  const data = db.data.alavirien;
  const dbIds = data.toUpdateIds;
  if (!dbIds) {
    //if no data in db, nothing to do
    console.log("no data in db.data.alavirien.toUpdateIds");
    return;
  }
  console.log("alavirien toUpdateIds", dbIds.length);

  //get personality
  const personality = PERSONALITY.getAdmin(); //get personality
  const alavirien = personality.alavirien;

  const today = dayjs(); //get today date

  for (const id of dbIds) {
    //db data format : { userId: authorId, messageNumber: number, joinAt: date}
    const curDbData = data.users.find(({ userId }) => userId === id);
    if (!curDbData) {
      //if no db data, log and skip
      console.log(`Unable to find alavirien data from toUpdateId ${id}`);
      continue;
    }
    const { userId, messageNumber, joinAt } = curDbData;
    const day = dayjs(joinAt);
    const deltaT = today.diff(day); //diff between joining date and now in ms

    //check if 1 week + 20 messages : alavirien requirement
    const isOneWeek = deltaT > 604800000; // 1week = 7*24*3600*1000 ms
    const is20Messages = messageNumber >= 20;
    if (isOneWeek && is20Messages)
      giveAlavirien(client, server, alavirien, userId);
    //if doesn't respect requirements, nothing to do
  }
};

export const setupAlavirien = async (client, tomorrow, frequency) => {
  //init everyday Alavirien
  const timeToTomorrow = tomorrow.minute(5).diff(dayjs()); //time to tommorow in ms

  setTimeout(async () => {
    //timeout until tomorrow

    const server =
      process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd(); //get server data
    checkAlavirien(client, server); //check for alavirien role attribution

    setInterval(checkAlavirien, frequency, client, server);
  }, timeToTomorrow);
};
