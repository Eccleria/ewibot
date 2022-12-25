/*
//Test suffle color
setTimeout(async (client, commons) => {
  console.log("end timeout")
  setInterval(async (client, commons) => {
    console.log("end interval")
    await shuffleRoleColor(client, commons)
  }, 5000, client, commons)
}, 3000, client, commons)

const colorList = ["#e74c3c", "#f1c40f", "#3498db", "#2ecc71", "#9b59b6", "#1abc9c"]; //Orange, yellow, blue, green, purple, cyan

export const shuffleRoleColor = async (client, commons) => {
  const currentServer = commons.find((element) => element.name = "test")
  const roles = Object.values(currentServer.roles); // list of roles
  const guild = await client.guilds.fetch(currentServer.guildId)
  let colorToApply = colorList;
  roles.forEach(async (roleData) => {
    const role = await guild.roles.fetch(roleData.roleId);
    const rd = Math.round((colorToApply.length - 1) * Math.random());
    role.setColor(colorToApply[rd]);
    colorToApply = [...colorToApply.slice(0, rd), ...colorToApply.slice(rd + 1)];
  })
}

*/