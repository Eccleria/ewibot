export const roleInit = async (client, commons) => {
  // Client init and check reactions on role message
  const server =
    process.env.DEBUG === "yes"
      ? commons.find(({ name }) => name === "test")
      : commons.find(({ name }) => name === "prod");
  const rolesJson = Object.entries(server.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]

  //client init
  client.roles = {};
  rolesJson.forEach((role) => {
    client.roles[role[1].roleId] = { name: role[1].name, members: [] };
  }, {});

  //check if the message has all Ewibot reactions
  const channel = await client.channels.fetch(server.roleHandle.channelId); //get the channel
  const message = await channel.messages.fetch(server.roleHandle.messageId); //get the message
  const messageReactions = message.reactions.cache; //get all the reactions data
  const reactionsNames = rolesJson.map((element) => element[1].name); //get the name of handled reactions

  await reactionsNames.forEach(async (emoteName) => {
    //get messageReaction associated to emoteName
    const messageReaction = messageReactions.find(
      (object) => object.emoji.name === emoteName
    );
    let users = {};
    try {
      users = await messageReaction.users.fetch(); //get all users that reacted with emoteName
      console.log("initHasUsers", users.size);
      if (!users.has(process.env.CLIENTID))
        //if no bot reaction
        await message.react(emoteName); //add missing reaction
    } catch {
      // if no data
      await message.react(emoteName); //add missing reaction
      console.log("init No users", users);
    }
  });
};

const roleClientHandler = async (client, guild, roles) => {
  // synchronize client with recent data
  console.log("client.roles", client.roles);
  roles.forEach(async (roleObject) => {
    const roleParam = Object.values(roleObject[1]); //get role parameters - [roleId, name]
    const roleName = roleObject[0]; //get role name - color
    const roleId = roleParam[0]; //get role id
    const role = await guild.roles.fetch(roleId); //fetch role

    const membersIds = role.members.reduce((acc, cur) => {
      //get the users having that role not in client
      if (!client.roles[roleId].members.includes(cur.id))
        return [...acc, cur.id];
      else return acc;
    }, []);
    console.log("client before synchro", roleName, membersIds);

    const usersIdsToAdd = [...client.roles[roleId].members, ...membersIds]; //concat already_in_client and not_in_client usersIds
    //add data to client
    client.roles[roleId] = { name: roleName, members: usersIdsToAdd };
  });
};

export const roleHandler = async (client, messageReaction, currentServer) => {
  //handle reactions added to the role message

  //synchronize client data
  const rolesJson = Object.entries(currentServer.roles); //get all the roles we are working with - format : [color, {roleId:, name:}]
  const guild = await client.guilds.fetch(currentServer.guildId); //fetch the guild
  await roleClientHandler(client, guild, rolesJson); //handle client data

  //get reaction names
  const reactionsNames = rolesJson.map((element) => element[1].name);
  console.log("reactionsNames", reactionsNames);

  //check for correct triggering reaction
  const reactionName = messageReaction.emoji.name; //get triggering reaction name
  console.log(reactionName);
  if (!reactionsNames.includes(reactionName)) {
    //If undesired emote added to the message => remove it and return
    messageReaction.remove();
    console.log("wrong reaction");
    return;
  }

  //get all message reactions data
  const message = await messageReaction.message.fetch(); //fetch message information
  const messageReactions = message.reactions.cache; //get all reactions on the message

  //get role parameters in servers.json
  const roleParam = rolesJson.find((role) => role[1].name === reactionName); //get json data for triggering role
  const roleIdtoAdd = roleParam[1].roleId; //get the role id associated to the triggering reaction
  const roleName = roleParam[1].name; //get triggering reaction name
  const rolesIds = rolesJson.map((element) => element[1].roleId); //get all roles ids

  //get other message reactions data
  const messageOtherReactions = messageReactions.filter((object) => {
    const emojiName = object.emoji.name;
    return emojiName !== roleName && reactionsNames.includes(emojiName);
  }); //get other reaction data than triggering reaction
  console.log("messageOtherReactions.keys()", messageOtherReactions.keys());

  //get guild role data
  const roleGuild = await guild.roles.fetch(roleIdtoAdd); //get role from guild
  const roleGuildMembers = roleGuild.members; //get all having_that_role members
  console.log("roleGuildMembers.size", roleGuildMembers.size);

  //get every userId that reacted but not in client
  const triggeringReactUsers = await messageReaction.users.fetch(); //all users having the triggering reaction
  const usersIdsToChangeRole = triggeringReactUsers.reduce((acc, cur) => {
    const userId = cur.id;
    //if client has userId in the roleIdtoAdd member list or is bot, nothing to do
    if (
      client.roles[roleIdtoAdd].members.includes(userId) ||
      userId === process.env.CLIENTID
    )
      return acc;
    else return [...acc, userId]; //return userId if not in client
  }, []);
  console.log("usersIdsToChangeRole", usersIdsToChangeRole);

  //handle client, role and reaction change for every identified user
  await usersIdsToChangeRole.forEach(async (userId) => {
    if (roleGuildMembers.every((member) => member.user.id !== userId)) {
      //if doesn't have the triggering role
      const guildMember = await guild.members.fetch(userId); //get guildMember

      //check if user has other reactions, if yes remove them
      messageOtherReactions.forEach(async (element) => {
        const usersReacted = await element.users.fetch(); //get users that reacted
        if (usersReacted.has(userId)) {
          console.log("foundUserwithReaction", element.emoji.name, userId);
          await element.users.remove(userId);
          console.log("removed Reaction", element.emoji.name, userId);
        }
      });

      //taking care of roles and client
      await guildMember.roles.add(roleIdtoAdd); //add role to user
      console.log("guildMemberRoles", userId, guildMember.roles.cache.keys());
      const guildMemberRoles = guildMember.roles.cache; //get roles of guildMember
      await guildMemberRoles.forEach(async (cur) => {
        const roleId = cur.id;
        // if user has other role that is cosmetic, remove it
        if (rolesIds.includes(roleId) && roleId !== roleIdtoAdd) {
          await guildMember.roles.remove(roleId); //remove role
          client.roles[roleId].members = client.roles[roleId].members.filter(
            (id) => id !== userId
          ); //remove precedent user role in client
        }
      });
      const newClientRoleMembers = [
        ...client.roles[roleIdtoAdd].members,
        userId,
      ];
      client.roles[roleIdtoAdd].members = newClientRoleMembers; //add new user role in client
    }
  });
  console.log("clientUpdated", await client.roles);
};
