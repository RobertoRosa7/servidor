const fs = require("fs");
const path = require("path");
const http = require("http");
const https = require("https");
const cherrio = require("cheerio");
const Format = require("../utils/format");

class RandomNumber {
  constructor() {
    // this.saveFile().then(() => this.generatedTicket());ticket: [ '23', '14', '56', '6', '20', '28' ]
    // this.initialize();
    this.format = new Format();
    this.qtde = 10;
    this.gen = true;
    this.downloadURL();
  }

  async generateListSimulator(qtde) {
    return new Promise(async resolve => {
      const accu = [];
      await Array(qtde)
        .fill(0)
        .map(() =>
          this.createSimulateMegaPayload().then((res) => accu.push(res))
        );
        console.log(accu)
      resolve(accu)
    })
  }

  createPayloadMega() {
    return new Promise((resolve) => {
      const $ = cherrio.load(this.readFile("index.html"));
      const text = $(".AP7Wnd").text().trim();
      const payload = {};
      payload["content"] = this.format.extractTicket(text);
      payload["date"] = this.format.formatDate(this.format.extractDate(text));
      payload["concurso"] = this.format.extractConc(text);
      payload["create_at"] = new Date();
      resolve(payload);
    });
  }

  createSimulateMegaPayload() {
    return new Promise((resolve) => {
      const payload = {};
      payload["content"] = this.otherWayToGenerateArray(6);
      payload["date"] = new Date().toISOString().substring(0, 10);
      payload["concurso"] = `${new Date()
        .toISOString()
        .substring(0, 10)
        .split("-")[0]
        .substring(0, 2)}${new Date().getMonth() + 1}`;
      payload["create_at"] = new Date();
      resolve(payload);
    });
  }

  async downloadURL() {
    const megaList = { mega: [] };
    const cacheMega = this.readFile("mega.json");
    if (cacheMega) {
      const payload = JSON.parse(cacheMega);
      if (payload["date"] !== new Date().toISOString().substring(0, 10)) {
        console.log("Updating document(s) waiting...");
        this.savePayloadMega(payload);
      } else {
        console.log("Document is updated!");
        console.log(payload["mega"]);
      }
    } else {
      console.log("Create document...");
      this.savePayloadMega(megaList);
    }
  }

  async savePayloadMega(megaList) {
    try {
      if (this.gen) {
        const res = await this.generateListSimulator(this.qtde);
        res.forEach((value) => megaList["mega"].push(value));
        this.writePayload(megaList);
      } else {
        await this.fetchURL();
        megaList["mega"].push(await this.createPayloadMega());
        this.writePayload(megaList);
      }
    } catch (e) {
      console.log(e);
    }
  }

  async writePayload(megaList) {
    megaList["date"] = new Date().toISOString().substring(0, 10);
    megaList["total_index"] = await this.createIndex(megaList["mega"]);
    await this.saveAnyFile("mega.json", JSON.stringify(megaList));
  }

  fetchURL() {
    return new Promise((resolve) => {
      const options = {
        host: "www.google.com",
        path:
          "/search?q=resultado+mega+sena&oq=resultado+mega+sena&aqs=chrome.0.69i59j0i131i433l3j0i433j0l3.3759j0j7&sourceid=chrome&ie=UTF-8",
      };
      https
        .get(options, (res) => {
          var str = "";
          res.on("data", (chunk) => (str += chunk));
          res.on("end", async () =>
            resolve(await this.saveAnyFile("index.html", str))
          );
        })
        .end();
    });
  }

  async initialize() {
    const payload = {};
    payload["content"] = await this.saveFile(1);
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

  saveAnyFile(filename, data) {
    return new Promise((resolve) => {
      fs.writeFile(
        path.join(__dirname, `../data/${filename}`),
        data,
        "utf8",
        (err, res) => (err ? console.log(err) : resolve(res))
      );
    });
  }

  saveFile(num) {
    return new Promise(async (resolve, reject) => {
      console.log("Create file....");

      const cache = this.readFile("randomNumber.json");
      const payload = {};
      payload["content"] = await this.generateFinalList(num);

      if (cache) {
        const arr = JSON.parse(cache).content;
        payload["content"].forEach((v) => arr.push(v));
        payload["content"] = arr;
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

  readFile(filename) {
    const path2 = path.join(__dirname, `../data/${filename}`);
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
