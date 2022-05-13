export const roleInit = async (client, commons) => {
  // Client init and check reactions on role message
  const server =
    process.env.DEBUG === "yes"
      ? commons.find(({ name }) => name === "test")
      : commons.find(({ name }) => name === "prod");
  const rolesJson = Object.entries(server.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]

  //check if the message has all Ewibot reactions
  const channel = await client.channels.fetch(server.roleHandle.channelId); //get the channel
  const message = await channel.messages.fetch(server.roleHandle.messageId); //get the message

  //get emotes to add
  const removeEmote = server.removeEmoji; //get removeEmote
  const roleEmotes = rolesJson.map((element) => element[1].name); //get the name of handled reactions
  const reactionsNames = [...roleEmotes, removeEmote];

  for (const emoteName of reactionsNames) await message.react(emoteName); //add reaction
};

const reactionRemove = async (messageReactions, userId) => {
  //remove user reaction
  for (const element of messageReactions.values()) {
    const usersReacted = await element.users.fetch(); //get users that reacted
    if (usersReacted.has(userId)) await element.users.remove(userId);
  }
};

const setRoles = async (guildMember, rolesIds, roleChange) => {
  //remove required roles and update client
  const guildMemberRoles = guildMember.roles.cache; //get roles of guildMember

  await guildMemberRoles.forEach(async (cur) => {
    const roleId = cur.id;
    // if user has other role that is cosmetic, remove it
    if (rolesIds.includes(roleId) && roleId !== roleChange)
      await guildMember.roles.remove(roleId); //remove role
  });
};

export const roleHandler = async (messageReaction, currentServer, user) => {
  //handle reactions added to the role message
  const userId = user.id;
  if (userId === process.env.CLIENTID) return; //if bot, return

  const rolesJson = Object.entries(currentServer.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]
  const guild = await messageReaction.client.guilds.fetch(
    currentServer.guildId
  ); //fetch the guild

  //get reaction names
  const reactionsNames = rolesJson.map((element) => element[1].name); //get names of handled reactions
  const removeEmote = currentServer.removeEmoji; //get removeEmote

  //check for correct triggering reaction
  const reactionName = messageReaction.emoji.name; //get triggering reaction name
  if (!reactionsNames.includes(reactionName) && reactionName !== removeEmote) {
    messageReaction.remove();
    return;
  }

  //get all message reactions data
  const message = await messageReaction.message.fetch(); //fetch message information
  const messageReactions = message.reactions.cache; //get all reactions on the message

  const guildMember = await guild.members.fetch(userId); //get guildMember

  const rolesIds = rolesJson.map((element) => element[1].roleId); //get all roles ids

  //if removeEmote => remove all reactions, cosmetic
  if (reactionName === removeEmote) {
    await reactionRemove(messageReactions, userId); //remove all user reactions
    await setRoles(guildMember, rolesIds); //remove all cosmetic role
    return;
  }

  //get role parameters in servers.json
  const roleParam = rolesJson.find((role) => role[1].name === reactionName); //get json data for triggering role
  const roleIdtoChg = roleParam[1].roleId; //get the role id associated to the triggering reaction

  //get other message reactions data
  const messageOtherReactions = messageReactions.filter((object) => {
    const emojiName = object.emoji.name;
    return emojiName !== reactionName;
  });

  //if doesn't have the triggering role, add it
  if (!guildMember.roles.cache.has(roleIdtoChg))
    await guildMember.roles.add(roleIdtoChg);

  await reactionRemove(messageOtherReactions, userId); //remove reactions if user has other

  //taking care of roles
  await setRoles(guildMember, userId, rolesIds, roleIdtoChg);
};
