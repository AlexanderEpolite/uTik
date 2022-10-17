#!

import {Master} from "discord-rose";
import { join } from "path";

const secrets = require("../secrets.json");

const token = secrets.token;
console.log(token);
const master = new Master(join(__dirname, "./Worker.js"), {
    token: token,
    intents: 33281,
});

master.start().then(() => {
    console.log("Master started");
});
