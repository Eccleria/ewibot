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
export const pollLog = logger.child({module: 'polls'});


//#endregion
