import pino from "pino";

//#region Logger

export const logger = pino({
  redact: ["TOKEN"],
  transport: {
    target: "pino-pretty",
    options: {
      colorize: true,
      ignore: "pid,hostname",
      translateTime: "SYS:standard",
    },
  },
});


//#endregion

//#region Childs
//Admin

//classes
export const classPollsLog = logger.child({module: 'classPolls'});

//commands
export const birthdayLog = logger.child({module: 'birthday'});
export const botEmoteLog = logger.child({module: 'botEmote'});
export const botMessageLog = logger.child({module: 'botMessage'});
export const concreteLog = logger.child({module: 'concrete'});
export const eventRoleLog = logger.child({module: 'eventRole'});
export const giftLog = logger.child({module: 'gift'});
export const leadApoLog = logger.child({module: 'leadApo'});
export const personalityLog = logger.child({module: 'personality'});
export const pollLog = logger.child({module: 'polls'});
export const pronounsLog = logger.child({module: 'pronouns'});
export const reminderLog = logger.child({module: 'reminder'});
export const reverseLog = logger.child({module: 'reverse'});
export const shuttleLog = logger.child({module: 'shuttle'});
export const slashLog = logger.child({module: 'slash'});
export const statsLog = logger.child({module: 'stats'});
export const commandUtilsLog = logger.child({module: 'commandUtils'});
export const vestLog = logger.child({module: 'vest'});

//helpers
export const dbLog = logger.child({module: 'db'});
export const utilsLog = logger.child({module: 'utils'});

//main
//no child for bot.js
export const funLog = logger.child({module: 'fun'});
export const listenersLog = logger.child({module: 'mainListeners'});
export const statsUtilsLog = logger.child({module: 'stats'});


//#endregion
