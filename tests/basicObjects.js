export default class basicDiscordJs {
  constructor() {
    (this.guildMember = {
      id: process.env.CLIENTID,
      name: "Ewibot",
      nickname: "nickEwibot",
    }),
      (this.user = {
        id: process.env.CLIENTID,
        tag: "usernameEwibot#1234",
        username: "usernameEwibot",
      });
  }

  /**
   * basic discord guildMember object
   * @returns {object} guildMember object
   */
  getGuildMember() {
    return this.guildMember;
  }

  /**
   * basic discord user object
   * @returns {object} user object
   */
  getUser() {
    return this.user;
  }
}
