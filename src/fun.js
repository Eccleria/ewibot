//#region ACTIVITY
// activity list
const activityList = [
    { name: "Adrien Sépulchre", type: "LISTENING" },
    { name: "JDR Ewilan par Charlie", type: "PLAYING" },
    {
      name: "Ewilan EP" + (Math.round(7 * Math.random()) + 1).toString(),
      type: "WATCHING",
    },
    { name: "la bataille contre Azan", type: "COMPETING" },
    { name: "la création d'Al-Jeit", type: "COMPETING" },
    { name: "épier les clochinettes", type: "PLAYING" },
    { name: "compter les poêles", type: "PLAYING" },
  ];
  
  /**
   * Set the timeout for bot activity update.
   * @param {Object} client The bot Client.
   */
  export const updateActivity = (client) => {
    // set random waiting time for updating Ewibot activity
  
    const waitingTime = (20 * Math.random() + 4) * 3600 * 1000;
    setTimeout(() => {
      setActivity(client);
      updateActivity(client);
    }, waitingTime);
  };
  
  /**
   * Set the bot client activity with a random choice from activityList.
   * @param {Object} client The bot Client.
   */
  export const setActivity = (client) => {
    // randomise Ewibot activity
    const statusLen = activityList.length - 1;
    const rdmIdx = Math.round(statusLen * Math.random());
    const whichStatus = activityList[rdmIdx];
  
    //set client activity
    client.user.setActivity(whichStatus);
  };

//#endregion
  