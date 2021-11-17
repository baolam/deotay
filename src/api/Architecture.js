const { layers, sequential, loadLayersModel, tensor, losses, Optimizer } = require("@tensorflow/tfjs");
const SerialPort = require("serialport");
const Readline = require("@serialport/parser-readline");
const events = require("events");
const tts = require("google-tts-api");
const playsound = require("sound-play");
const fs = require("fs");

const EventEmitter = new events.EventEmitter();

class Architecture {
  static load_model = false;
  static labels = 3;
  static inputShape = [20, 3];
  static chars = ['NULL', 'a', 'b'];

  constructor() {
    this.model = this.__init();

    if (Architecture.load_model) {
      loadLayersModel('http://localhost:3000/testting/model.json')
      .then((model) => {
        console.log('Mô hình tải trọng số thành công!');
        this.model = model;
      })
      .catch((err) => {});  
    }

    // Summary
    console.log("Lối kiến trúc mô hình");
    this.model.summary();
    console.log("-----------------------------------------");
  }

  /**
   * @description
   * Khởi tạo mô hình
   * @returns 
   */
  __init() {
    let model = sequential();

    model.add(layers.lstm({ units : 20, inputShape : Architecture.inputShape, returnSequences : true }));
    model.add(layers.lstm({ units : 20, returnSequences : true }));
   
    model.add(layers.flatten());

    model.add(layers.dense({ units : 64, activation : "tanh" }));
    model.add(layers.dense({ units : 32, activation : "tanh" }));

    model.add(layers.dense({ units : Architecture.labels, activation : Architecture.labels == 1 ? "sigmoid" : "softmax" }));

    model.compile({ loss : Architecture.labels == 1 ? losses.sigmoidCrossEntropy : losses.softmaxCrossEntropy, optimizer : "adam", metrics : ["accuracy"] });
    return model;
  }

  /**
   * @description
   * Chạy mô hình
   */
  run(com_="COM3") {
    const com = new SerialPort(com_, {
      baudRate : 9600
    }, (err) => {
      if (err)
      {
        // Lỗi mở cổng
        console.log(err);
      }
      else {
        EventEmitter.emit("ok", "");
      }
    });

    EventEmitter.addListener("ok", () => {
      const parser = new Readline();
      com.pipe(parser);
      
      let X_ = [];
      let before = "";

      // Nhận dữ liệu từ cổng usb
      parser.on("data", (data) => {
        let cvt_data = String(data).replace('\r').split(',');
        cvt_data = cvt_data.map((vl) => parseFloat(vl));
        let temp = new Array(3);
        for (let i = 0; i < 3; i++)
          temp[i] = cvt_data[i] / 180;
        X_.push(temp);
        if (X_.length == Architecture.inputShape[0]) {
          let X = tensor([X_]);
          let predict = this.model.predict(X).dataSync();
          let char = '';
          if (Architecture.labels == 1) {
            char = predict >= 0.5 ? Architecture.chars[1] : Architecture.chars[0];
          }
          else {
            let index = 0, gtln = predict[0];
            for (let i = 1; i < predict.length; i++) {
              if (gtln < predict[i]) {
                gtln = predict[i];
                index = i;
              }
            }
            char = Architecture.chars[index];
          }
          console.log(`Char = ${char}. Predict = ${predict}`);
          if (before != char) {
            before = char;
            if (before == 'a') {
              tts.getAudioBase64("Uống nước. Tui muốn uống nước", {
                lang : "vi",
                slow : false,
                host : 'https://translate.google.com'
              })
              .then((strgs) => {
                let bs64 = strgs;

                fs.writeFileSync(`${__dirname}/play.mp3`, Buffer.from(bs64, "base64"), "base64");

                // setTimeout(() => {
                //   playsound.play(`${__dirname}/play.mp3`, 0.8);
                // }, 100);
                console.log('Play file');
                playsound.play(`${__dirname}/play.mp3`, 0.8);
              });
            }
            else if (before == 'b') {
              tts.getAudioBase64("Ăn. Tui muốn ăn", {
                lang : "vi",
                slow : false,
                host : 'https://translate.google.com'
              })
              .then((strgs) => {
                // console.log(strgs);
                let bs64 = strgs;

                fs.writeFileSync(`${__dirname}/play.mp3`, Buffer.from(bs64, "base64"), "base64");

                // setTimeout(() => {
                //   playsound.play(`${__dirname}/play.mp3`, 0.8);
                // }, 100);
                console.log('Play file');
                playsound.play(`${__dirname}/play.mp3`, 0.8);
              });
            } 
          }
          X_.splice(0, X_.length - 1);
        } 
      });
    });
  }
}

module.exports = Architecture;