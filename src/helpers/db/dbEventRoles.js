const getEventRoles = (db) => {
  return db.data.eventRoles;
};

const addEventRole = (db, guildId, roleName, roleId) => {
  const data = getEventRoles(db);
  const guildData = data.find((obj) => obj.guildId === guildId); //get correct server data

  if (guildData) {
    guildData[`${roleName}RoleId`] = roleId;
    db.wasUpdated = true;
    return true;
  } else return false;
};

const updateEventRoleMessageId = (db, guildId, messageId) => {
  const data = getEventRoles(db);
  const guildData = data.find((obj) => obj.guildId === guildId); //get correct server data
  guildData.roleMessageId = messageId;
  db.wasUpdated = true;
};

export { getEventRoles, addEventRole, updateEventRoleMessageId };
