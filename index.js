const express = require("express");
const http = require("http");
const path = require("path");
const Architecture = require("./src/api/Architecture");

const app = express();
const server = http.createServer(app);
const network = new Architecture();

app.use(express.static(path.join(__dirname, "src" ,"public")));

server.listen(3000, () => {});

// Tạo timeout để chạy
setTimeout(() => {
  try {
    network.run();
  } catch (err) {
    
  }
}, 1000);