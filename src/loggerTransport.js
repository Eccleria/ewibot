import PinoPretty from "pino-pretty";

const prefix = "\u001B[";

class Color {
  constructor(start, end) {
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

const Modules = {
  polls: new Color(33, 39),
  reminder: new Color(42, 49)
}

export default (opts) => PinoPretty({
  ...opts,
  messageFormat: (log, messageKey) => {
    //console.log("log", log);
    let moduleText = '';
    if (log.module) {
      const color = Modules[log.module];
      moduleText = `${color.start}${log.module}${color.end} - `;
    }
    delete log.module; 
    const text = moduleText + log[messageKey];

    return text;
  }
});
