import PinoPretty from "pino-pretty";

const prefix = " \u001B[";

class Color {
  constructor(start = 36, end = 39) {
    this._start = prefix + start + "m";
    this._end = prefix + end + "m";
  };

  get start() {
    return this._start;
  }
  get end() {
    return this._end;
  }
}

/* 
30: black
31: red
32: green
33: yellow
34: blue
35: magenta
36: cyan
37: white
39: default
*/
const Modules = {
  //admin
  role: new Color(35, 39),
  aPronouns: new Color(35, 39),

  //classes
  classPolls: new Color(33, 39),

  //commands
  birthday: new Color(32, 39),
  botEmote: new Color(31, 39),
  botMessage: new Color(31, 39),
  concrete: new Color(32, 39),
  eventRole: new Color(31, 39),
  gift: new Color(32, 39),
  leadApo: new Color(31, 39),
  personality: new Color(31, 39),
  polls: new Color(33, 39),
  reminder: new Color(42, 49),
  reverse: new Color(32, 39),
  shuffle: new Color(31, 39),
  slash: new Color(31, 39),
  stats: new Color(32, 39),
  commandUtils: new Color(34, 39),
  vest: new Color(32, 39),

  //helpers
  db: new Color(44, 49),
  utils: new Color(34, 39),

  //main
  fun: new Color(),
  mainListeners: new Color(),
  stats: new Color(),
}

export default (opts) => PinoPretty({
  ...opts,
  messageFormat: (log, messageKey) => {
    let moduleText = '';
    if (log.module) {
      const color = Modules[log.module];
      moduleText = `${color.start}${log.module}${color.end} - `;
    } else moduleText = ' ';
    delete log.module; //no need to print it
    const text = moduleText + log[messageKey];

    return text;
  }
});
