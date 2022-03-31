
const roleInitiate = async (client, currentServer) => {
  if (client.roles) return;

  const guild = await client.guilds.fetch(currentServer.guildId); //get the guild
  const roles = Object.entries(currentServer.roles); //get all the roles we are working with

  client.roles = {} //initialize
  roles.forEach(async (roleList) => {
    const roleParam = Object.values(roleList[1]); //get role parameters
    const roleName = roleList[0]; //get role name
    const roleReact = roleParam[0]; //get role reaction associated
    const roleId = roleParam[1]; //get role Id
    const role = await guild.roles.fetch(roleId); //get role

    const membersIds = role.members.reduce((acc, cur) => { //get the users having that role
      return [...acc, cur.id]
    }, []);

    //add data to client
    client.roles[roleId] = { name: roleName, react: roleReact, members: membersIds };
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
  await roleInitiate(client, currentServer);
  console.log(client.roles);
  /*
  const { message } = messageReaction;
  //console.log("roles", client)

  const users = await messageReaction.users.fetch();
  */
  /*
  const guildId = message.guildId
  const guild = await client.guilds.fetch(guildId);
  const guildMember = await guild.members.fetch(userId);
  const userRoles = guildMember.roles;
  console.log(userRoles);*/
};