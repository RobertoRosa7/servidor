const EventEmitter = require("events").EventEmitter;
const inherits = require("util").inherits;

class Format {
  constructor() {
    EventEmitter.call(this);
  }

  timerRegressive(duration = 0, display) {
    let timer = duration;
    let minutes = 0;
    let seconds = 0;
    let hours = 0;

    const interval = setInterval(() => {
      hours = parseInt((timer / 3600) % 24, 10);
      minutes = parseInt((timer / 60) % 60, 10);
      seconds = parseInt(timer % 60, 10);

      hours = hours < 10 ? "0" + hours : hours;
      minutes = minutes < 10 ? "0" + minutes : minutes;
      seconds = seconds < 10 ? "0" + seconds : seconds;

      console.log(hours + ":" + minutes + ":" + seconds);

      if (--timer < 0) {
        this.clearInterval(interval);
        setImmediate(() => this.emit("timeregressive", "done"));
      }
    }, 1000);
  }

  calcTimeUnlocked(time_start) {
    const _24 = 24 * 60 * 60;
    const now = new Date();
    const past = new Date(time_start);
    const diff = Math.abs(now.getTime() - past.getTime());
    const daysTimesStamp = Math.ceil(diff / 1000);

    return _24 - daysTimesStamp;
  }

  clearInterval(interval) {
    clearInterval(interval);
  }

  formatDate(date) {
    const arrDate = date.split("/");
    const year = arrDate[0];
    const month = arrDate[1];
    const day = arrDate[2];
    const y = new Date().getFullYear();
    return `${y}-${month}-${day}`;
  }
}

inherits(Format, EventEmitter);
module.exports = Format;
