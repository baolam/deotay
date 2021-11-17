const google = require("google-tts-api");
const fs = require("fs");
const playSound = require("sound-play");

google.getAllAudioBase64("Lâm là một người cực kỳ dễ thương",{
  lang : 'vi',
  host : 'https://translate.google.com',
  slow : false
})
.then((strgs) => {
  let bs64 = strgs[0].base64;
  fs.writeFileSync("haha.mp3", Buffer.from(bs64, 'base64'), "base64");
  
  // playSound.play(`${__dirname}/haha.mp3`, (err) => {
  //   if (err)
  //     console.log(err);
  // })
  // console.log(playSound.player);
  // playSound.test();
  playSound.play(`${__dirname}/haha.mp3`, 0.9);
});