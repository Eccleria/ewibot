export default class basicDiscordJs {
  constructor() {
    (this.guildMember = {
      id: "931272900915372122",
      name: "Ewibot",
      nickname: "nickEwibot",
    }),
      (this.user = {
        id: "931272900915372122",
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