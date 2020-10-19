const fs = require("fs");
const path = require("path");
const http = require("http");

const url_caixa =
  "http://loterias.caixa.gov.br/wps/portal/loterias/landing/megasena/";

class RandomNumber {
  constructor() {
    // this.saveFile().then(() => this.generatedTicket());ticket: [ '23', '14', '56', '6', '20', '28' ]
    // this.initialize();
    const options = {
      host: "http://loterias.caixa.gov.br",
      path: "/wps/portal/loterias/landing/megasena/",
    };

    try {
      http
        .request(options, (response) => {
          var str = "";
          response.on("data", (chunk) => (str += chunk));
          response.on("end", () => console.log(str));
        })
        .end();
    } catch (e) {}
  }

  async initialize() {
    const payload = {};
    payload["content"] = await this.saveFile(10);
    payload["total_index"] = await this.createIndex(payload["content"]);
    payload["repeated"] = await this.createUnitTicket(payload["content"]);
    payload["ticket"] = await this.createTicket(
      await this.createOccurrencies(
        await this.createUnitList(payload["content"])
      )
    );
    console.log(payload);
  }

  createIndex(payload = []) {
    console.log("get total index...");
    return new Promise((resolve) => resolve(payload.length));
  }

  createUnitList(payload) {
    console.log("Create an unique list...");
    return new Promise((resolve) => {
      const arr = [];
      payload.forEach((value) => value.forEach((v) => arr.push(v)));
      resolve(arr);
    });
  }

  createUnitTicket(payload) {
    console.log("Create unique ticket...");
    return new Promise((resolve) => {
      const repeated = [];
      payload.forEach((value, index, array) => {
        const t = array.map((v) => JSON.stringify(v));
        if (t.indexOf(JSON.stringify(value)) !== index) repeated.push(value);
      });
      resolve(repeated.sort());
    });
  }

  createOccurrencies(payload) {
    console.log("Create occurrencies...");
    return new Promise((resolve) => {
      const obj = {};
      payload.forEach((value) => {
        if (!obj[value]) obj[value] = 0;
        obj[value]++;
      });
      resolve(obj);
    });
  }

  createTicket(occurrencies) {
    return new Promise((resolve) =>
      resolve(
        Object.entries(occurrencies)
          .sort((a, b) => b[1] - a[1])
          .map((el) => el[0])
          .slice(0, 6)
      )
    );
  }

  // generatedTicket() {
  //   const arr = [];
  //   const repetidos = [];
  //   const obj = {};

  //   JSON.parse(this.readFile()).content.forEach((value, index, array) => {
  //     value.forEach((v) => arr.push(v));
  //     const t = array.map((v) => JSON.stringify(v));
  //     if (t.indexOf(JSON.stringify(value)) !== index) repetidos.push(value);
  //   });

  //   arr.forEach((value) => {
  //     if (!obj[value]) obj[value] = 0;
  //     obj[value]++;
  //   });

  //   const ticket = {
  //     ticket: Object.entries(obj)
  //       .sort((a, b) => b[1] - a[1])
  //       .map((el) => el[0])
  //       .slice(0, 6),
  //     occurrencies: Object.entries(obj)
  //       .sort((a, b) => b[1] - a[1])
  //       .slice(0, 6),
  //     repetidos_list: repetidos.sort(),
  //   };
  //   console.log(ticket);
  // }

  saveFile(num) {
    return new Promise(async (resolve, reject) => {
      console.log("Create file....");

      const cache = this.readFile();
      const payload = {};
      payload["content"] = await this.generateFinalList(num);

      if (cache) {
        const arr = JSON.parse(cache);
        payload.forEach((v) => arr.push(v));
        payload = arr;
      }

      fs.writeFile(
        path.join(__dirname, "../data/randomNumber.json"),
        JSON.stringify(payload),
        "utf8",
        (err) => (err ? console.log(err) : resolve(payload["content"]))
      );

      console.log("Done!!!");
    });
  }

  readFile() {
    const path2 = path.join(__dirname, "../data/randomNumber.json");
    try {
      if (fs.existsSync(path2)) {
        return fs.readFileSync(path2, "utf-8");
      }
    } catch (e) {
      console.log(e);
    }
  }

  otherWayToGenerateArray(qtd) {
    return Array(qtd)
      .fill(0)
      .reduce((n) => [...n, this.gerarNumNaoContido(1, 61, n)], [])
      .sort((a, b) => a - b);
  }

  generateFinalList(qtd) {
    console.log("Create final list...");
    return new Promise((resolve) =>
      resolve(
        Array(qtd)
          .fill(0)
          .reduce((accu) => [...accu, this.otherWayToGenerateArray(6)], [])
          .sort((a, b) => a - b)
      )
    );
  }

  gerarNumNaoContido(min, max, array) {
    const random = Math.ceil(Math.random() * (max - min) + min);
    return array.includes(random)
      ? this.gerarNumNaoContido(min, max, array)
      : random;
  }
}
new RandomNumber();
