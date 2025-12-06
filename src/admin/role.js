import { COMMONS } from "../commons.js";
import { fetchChannel, fetchGuild, fetchMember, fetchMessage } from "../helpers/index.js";

export const roleInit = async (client) => {
  console.log("role init");
  // Client init and check reactions on role message
  const server =
    process.env.DEBUG === "yes" ? COMMONS.getTest() : COMMONS.getProd();

  const rolesJson = Object.values(server.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]

  //check if the message has all Ewibot reactions
  const channel = await fetchChannel(
    client.channels,
    server.cosmeticRoleHandle.channelId,
  ); //get the channel
  const message = await fetchMessage(
    channel.messages,
    server.cosmeticRoleHandle.messageId,
  ); //get the message

  //get emotes to add
  const reactionsNames = rolesJson.map((element) => element.name); //get the name of handled reactions

  for (const emoteName of reactionsNames) await message.react(emoteName); //add reaction
};

export const roleAdd = async (messageReaction, currentServer, user) => {
  //handle reactions added to the cosmetic roles message
  const userId = user.id;
  if (userId === process.env.CLIENTID) return; //if bot, return

  //fetch user data
  const guild = await fetchMember(
    messageReaction.client.guilds,
    currentServer.guildId,
  ); //fetch the guild
  const guildMember = await fetchMember(guild.members, userId); //get guildMember

  //check for alavirien role
  if (!guildMember.roles.cache.has(currentServer.alavirienRoleId)) {
    messageReaction.users.remove(userId); //remove wrong reaction
    return; //if not having role, return
  }

  //check for correct triggering reaction
  const rolesJson = Object.values(currentServer.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]
  const reactionsNames = rolesJson.map((element) => element.name); //get names of handled reactions
  const reactionName = messageReaction.emoji.name; //get triggering reaction name
  if (!reactionsNames.includes(reactionName)) {
    messageReaction.users.remove(userId); //remove wrong reaction
    return;
  }

  //get role parameters in servers.json
  const roleParam = rolesJson.find((role) => role.name === reactionName); //get json data for triggering role
  const roleIdtoChg = roleParam.roleId; //get the role id associated to the triggering reaction

  guildMember.roles.add(roleIdtoChg); //add requested role
};

export const roleRemove = async (messageReaction, currentServer, user) => {
  const userId = user.id;
  if (userId === process.env.CLIENTID) return; //if bot, return

  const guild = await fetchGuild(
    messageReaction.client,
    currentServer.guildId,
  ); //fetch the guild
  const guildMember = await fetchMember(guild.members, userId); //get guildMember

  //check for correct triggering reaction
  const rolesJson = Object.values(currentServer.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]
  const reactionsNames = rolesJson.map((element) => element.name); //get names of handled reactions
  const reactionName = messageReaction.emoji.name; //get triggering reaction name
  if (!reactionsNames.includes(reactionName)) {
    messageReaction.users.remove(userId); //remove wrong reaction
    return;
  }

  //get commons data
  const roleParam = rolesJson.find((role) => role.name === reactionName); //get json data for triggering role
  const roleIdtoChg = roleParam.roleId; //get the role id associated to the triggering reaction

  await guildMember.roles.remove(roleIdtoChg); //remove all cosmetic role
};
