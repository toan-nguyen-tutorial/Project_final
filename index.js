const express = require("express");
const http = require('http');
const mqtt = require("mqtt");
const path = require("path");
const {Server} = require('socket.io');


const app = express();
const server = http.createServer(app);
const io = new Server(server);

const port = 3000;

const MQTT_BROKER_URL =
  "mqtts://36bc90c964b142c3aab52c68c90c9cd0.s1.eu.hivemq.cloud:8883";
const MQTT_TOPIC = "HVAC_datapoints";

const mqttOptions = {
  username: "hivemq.webclient.1735286041156",
  password: "a?DY!4efwIzJ7#sH0:L8",
  rejectUnauthorized: false,
};
let latestData = {};
const client = mqtt.connect(MQTT_BROKER_URL, mqttOptions);

client.on("connect", () => {
  console.log("Connected to MQTT Broker");
  client.subscribe(MQTT_TOPIC, { qos: 0 }, (err) => {
    if (err) console.error("Subscribe error:", err);
  });
});
client.on("message", (topic, message) => {
    //Topic case:
    if (topic === MQTT_TOPIC) {
    try {
      latestData = JSON.parse(message.toString());
      console.log("Received data:", latestData.Chiller.Motors);
      io.emit("socketPackages", latestData);
    } catch (e) {
      console.error("JSON parse error:", e);
    }
  }
});


//Set view engine EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

//Static files
app.use(express.static(path.join(__dirname, "public")));

// Import routes
const homeRoutes = require("./routers/homeRouter");
app.use("/", homeRoutes);

server.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
