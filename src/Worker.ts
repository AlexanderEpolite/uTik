
import {Worker} from "discord-rose";
import Downloader from "./util/Downloader";
import {readFileSync} from "fs";

const worker = new Worker();

//https://(www).tiktok.com/t/abc123zyx
const REGEX_A = /https:\/\/(www\.)?tiktok\.com\/t\/(\w+)/;

//https://(www).tiktok.com/@user.name/video/123123123123
const REGEX_B = /https:\/\/(www\.)?tiktok\.com\/@([a-zA-Z\d._-]+)\/video\/(\w+)/;

worker.on("MESSAGE_CREATE", (msg) => {
    
    if(msg.author.bot) return;
    
    //check if the message contains a 'Tok link (note: the message
    //may contain text before or after the link)
    const match = msg.content.match(REGEX_A) || msg.content.match(REGEX_B);
    if (!match) return;
    
    //get the link
    const link = match[0];
    
    if(!link) return;
    
    worker.api.messages.send(msg.channel_id, {
        content: "This video is being de-Tok'd, please wait a few seconds...",
    }).then(r => {
        setTimeout(() => {
            worker.api.messages.delete(msg.channel_id, r.id);
        }, 5000);
    });
    
    Downloader.downloadVideo(link, msg.id).then((path) => {
        const buffer = readFileSync(path);
        worker.api.messages.sendFile(msg.channel_id, {
            buffer,
            name: `uTik-${msg.id}.mp4`,
        }, {
            content: "A de-tok'd version of this video has arrived",
            message_reference: {
                channel_id: msg.channel_id,
                message_id: msg.id,
                fail_if_not_exists: true,
            },
            allowed_mentions: {
                parse: [],
            }
        });
    });
});
