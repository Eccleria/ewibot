//Merge Sort algorithm
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
};

const roleInitiate = async (client, guild, roles) => {
  if (!client.roles) { //initialize client
    client.roles = {};
    roles.forEach((role) => {
      client.roles[role[1].roleId] = { name: role[1].name, react: role[1].react, members: [] }
    }, {});
  }
  console.log("client.roles", client.roles);

  roles.forEach(async (roleList) => {
    const roleParam = Object.values(roleList[1]); //get role parameters
    const roleName = roleList[0]; //get role name
    const roleReact = roleParam[0]; //get role reaction associated
    const roleId = roleParam[1]; //get role id
    const role = await guild.roles.fetch(roleId); //fetch role
    //console.log(role.members)
    const membersIds = role.members.reduce((acc, cur) => { //get the users having that role not in client
      if (!client.roles[roleId].members.includes(cur.id)) return [...acc, cur.id]
      else return acc;
    }, []);
    console.log(roleName, membersIds);
    const usersIdsToSort = [...client.roles[roleId].members, ...membersIds]; //concat already_in_client and not_in_client usersIds
    const sortedMembersIds = mergeSort(usersIdsToSort); //sort the members'_Ids_having_that_role list
    //add data to client
    client.roles[roleId] = { name: roleName, react: roleReact, members: sortedMembersIds };
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
  const roles = Object.entries(currentServer.roles); //get all the roles we are working with
  const guild = await client.guilds.fetch(currentServer.guildId); //get the guild
  await roleInitiate(client, guild, roles); //initiate client data

  //'🔵' blue
  // '🟠' orange
  // '🟣' purple
  // '🟢' green

};