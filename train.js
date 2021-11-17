const lowdb = require("lowdb");
const Adapter = require("lowdb/adapters/FileSync");

const Architecture = require("./src/api/Architecture");
const { tensor } = require("@tensorflow/tfjs");
require("tfjs-node-save");

const architecture = new Architecture();
const my_data = lowdb(new Adapter("data.json"));

const dataset = my_data.get("data").toJSON();

let X = [];
let y = [];
let loss = 10000;

dataset.forEach((obj) => {
  X.push(obj.features);
  if (Architecture.labels == 1) {
    y.push(obj.label);
  }
  else {
    let arr_temp = new Array(Architecture.labels);
    for (let i = 0; i < Architecture.labels; i++) {
      arr_temp[i] = 0;
      if (i == obj.label - 1) {
        arr_temp[i] = 1;
      }
    }
    y.push(arr_temp);
  }
});

function onBatchEnd(batch, logs) {
  console.log(`   Batch = ${batch}, Loss = ${logs.loss}, Acc = ${logs.acc}`);
}

function onEpochEnd(epoch, logs) {
  console.log(`Epoch = ${epoch}, Loss = ${logs.loss}, Acc = ${logs.acc}`);
  if (logs.acc >= 0.5 && epoch % 2 == 0
    && epoch > 0) {
    if (loss > logs.loss) {
      loss = logs.loss;
    }
  }
}

X = tensor(X);
y = tensor(y);
architecture.model.fit(X, y, {
  epochs : 12,
  shuffle : true,
  callbacks : { onBatchEnd, onEpochEnd }
});

architecture.model.save('file://src/public/testting');