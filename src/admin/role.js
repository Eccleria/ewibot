/*//Merge Sort algorithm
const mergeSort = (T) => {
  const len = T.length;
  if (len <= 1) return T;

  const middle = Math.round(len / 2);
  const left = T.slice(0, middle);
  const right = T.slice(middle);

  return merge(mergeSort(left), mergeSort(right));
};

const merge = (T1, T2) => {
  if (T1.length === 0) return T2;
  if (T2.length === 0) return T1;
  if (T1[0] <= T2[0]) return [T1[0], ...merge(T1.slice(1), T2)];
  else return [T2[0], ...merge(T1, T2.slice(1))];
};*/

const roleClient = async (client, guild, roles) => {
  if (!client.roles) {
    //initialize client
    client.roles = {};
    roles.forEach((role) => {
      client.roles[role[1].roleId] = { name: role[1].name, members: [] };
    }, {});
  }
  console.log("client.roles", client.roles);

  roles.forEach(async (roleList) => {
    const roleParam = Object.values(roleList[1]); //get role parameters
    const roleName = roleList[0]; //get role name
    const roleId = roleParam[0]; //get role id
    const role = await guild.roles.fetch(roleId); //fetch role
    const membersIds = role.members.reduce((acc, cur) => {
      //get the users having that role not in client
      if (!client.roles[roleId].members.includes(cur.id))
        return [...acc, cur.id];
      else return acc;
    }, []);
    console.log(roleName, membersIds);
    const usersIdsToSort = [...client.roles[roleId].members, ...membersIds]; //concat already_in_client and not_in_client usersIds
    //const sortedMembersIds = mergeSort(usersIdsToSort); //sort the members'_Ids_having_that_role list
    //add data to client
    client.roles[roleId] = { name: roleName, members: usersIdsToSort };
  });
};

export const roleHandler = async (client, messageReaction, currentServer) => {
  /*
   quand un utilisateur clique sur une reaction le bot :

   * verifie que l'utilisateur n'a pas mis d'autres reactions, si c'est le cas le bot supprime
   la reaction.
   * verifie que que l'utilisateur n'a pas d'autres roles que celui cliqué, sinon il supprime 
   les autres roles.
   
   Puis le bot attribue le role associé à la reaction
   */

  //synchronize client data
  const rolesJson = Object.entries(currentServer.roles); //get all the roles we are working with - format : [color, {react:, roleId:, name:}]
  const guild = await client.guilds.fetch(currentServer.guildId); //fetch the guild
  await roleClient(client, guild, rolesJson); //handle client data

  const sameReactUsers = await messageReaction.users.fetch(); //all users having the same reaction

  //get all guild roles usefull data
  const reactionsNames = rolesJson.map((element) => element[1].name); //get all reactions names
  console.log("reactionsNames", reactionsNames);
  const rolesIds = rolesJson.map((element) => element[1].roleId);  //get all roles ids

  //check for correct triggering reaction
  const reactionName = messageReaction.emoji.name; //get triggering reaction name
  console.log(reactionName);
  if (!reactionsNames.includes(reactionName)) {
    //If undesired emote added to the message => remove it and return
    messageReaction.remove();
    console.log("wrong reaction");
    return;
  }

  //get role parameters in servers.json
  const roleParam = rolesJson.find((role) => role[1].name === reactionName); //get json data for triggering role
  const roleIdtoAdd = roleParam[1].roleId; //get the role id associated to the triggering reaction
  const roleName = roleParam[1].name; //get triggering reaction name
  const role = await guild.roles.fetch(roleIdtoAdd); //get role from guild
  const roleMembers = role.members; //get all having_that_role members
  console.log("roleMembers.size", roleMembers.size);

  //get every userId that reacted but not in client
  const usersIdsToChangeRole = sameReactUsers.reduce((acc, cur) => {
    const userId = cur.id;
    if (client.roles[roleIdtoAdd].members.includes(userId)) return acc; //if client has userId in the roleIdtoAdd member list, nothing to do
    else return [...acc, userId]; //return userId if not in client
  }, []);
  console.log("usersIdsToChangeRole", usersIdsToChangeRole);

  //get other message reactions data
  const message = await messageReaction.message.fetch(); //fetch message information
  const messageReactions = message.reactions.cache; //get all reactions on the message
  const messageOtherReactions = messageReactions.filter((object) => {
    const emojiName = object.emoji.name;
    return emojiName !== roleName && reactionsNames.includes(emojiName);
  }); //get other than triggering reaction data
  console.log("messageOtherReactions.keys()", messageOtherReactions.keys());

  //handle client, role and reaction change for every identified user
  await usersIdsToChangeRole.forEach(async (userId) => {
    if (roleMembers.every((member) => member.user.id !== userId)) {
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
      console.log("guildMemberRoles", guildMember.roles.cache.keys());
      const guildMemberRoles = guildMember.roles.cache;
      const rolesToRemove = guildMemberRoles.reduce((acc, cur) => {
        if (rolesIds.includes(cur.id) && cur.id !== roleIdtoAdd)
          return [...acc, cur.id];
        else return [...acc];
      }, []);
      console.log("rolesToRemove", rolesToRemove);
      rolesToRemove.forEach(async (roleId) => {
        await guildMember.roles.remove(roleId); //remove roles
        client.roles[roleId].members = client.roles[roleId].members.filter(
          (id) => id !== userId
        ); //remove precedent user role.s in client
      });
      const toSort = [...client.roles[roleIdtoAdd].members, userId];
      //client.roles[roleIdtoAdd].members = mergeSort(toSort); //add new user role in client
      client.roles[roleIdtoAdd].members = toSort; //add new user role in client
    }
  });
  console.log("clientUpdated", await client.roles);

  //'🔵' blue
  // '🟠' orange
  // '🟣' purple
  // '🟢' green
};
