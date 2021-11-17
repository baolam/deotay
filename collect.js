const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const Architecture = require("./src/api/Architecture");

const lowdb = require("lowdb");
const Adapter = require("lowdb/adapters/FileSync");

const my_data = lowdb(new Adapter("data.json"));
my_data.defaults({ data : [] }).write();

const com = new SerialPort("COM3", {
  baudRate : 9600
});
const parser = new Readline();
com.pipe(parser);

let count = 0;
let preparing = 0;
let X = [];
parser.on("data", (data) => {
  let cvt_data = String(data).replace('\r').split(',');
  cvt_data = cvt_data.map((vl) => parseFloat(cvt_data));
  let temp = new Array(3);
  for (let i = 0; i < 3; i++)
    temp[i] = cvt_data[i];
  count += 1;
  preparing += 1;
  console.log(`Preparing = ${preparing}`);
  if (preparing >= 100) {
    X.push(temp);
    if (X.length == Architecture.inputShape[0]) {
      console.log("Ghi file");
      my_data.get("data").push({
        features : X,
        label : 2
      }).write();
      X.splice(0, X.length - 1);
      // console.log(X);
      count = 0;
    }
  }
  if (preparing == 1100)
    preparing = 0;
});