#!

import {Master} from "discord-rose";
import { join } from "path";
import {sync as commandExists} from "command-exists";

if(!commandExists("yt-dlp")) {
    console.error(`===================================================`);
    console.error(`               YT-DLP WAS NOT FOUND!               `);
    console.error(`Please download it from the link in the repository.`);
    console.error(`If it is downloaded, ensure that it is in your PATH`);
    console.error(`===================================================`);
    process.exit(1);
}

const secrets = require("../secrets.json");

const token = secrets.token;

const master = new Master(join(__dirname, "./Worker.js"), {
    token: token,
    intents: 33281,
});

master.start().then(() => {
    console.log("Master started");
});
