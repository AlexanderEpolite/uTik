import {Worker} from "discord-rose";
import Downloader from "./util/Downloader";
import {readFileSync} from "fs";

const worker = new Worker();

//https://(www).tiktok.com/t/abc123zyx
const REGEX_A = /https:\/\/(www\.)?tiktok\.com\/t\/(\w+)/;

//https://(www).tiktok.com/@user.name/video/123123123123
const REGEX_B = /https:\/\/(www\.)?tiktok\.com\/@([a-zA-Z\d._-]+)\/video\/(\w+)/;

//https://vm.tiktok.com/ABC123/
const REGEX_C = /https:\/\/vm\.tiktok\.com\/(\w+)\//;

worker.on("MESSAGE_CREATE", (msg) => {
    
    if(msg.author.bot) return;
    
    //check if the message contains a 'Tok link (note: the message
    //may contain text before or after the link)
    const match = msg.content.match(REGEX_A) || msg.content.match(REGEX_B) || msg.content.match(REGEX_C);
    if (!match) return;
    
    //get the link
    const link = match[0];
    
    if(!link) return;
    
    worker.api.messages.send(msg.channel_id, {
        content: "This video is being de-Tok'd, please wait a few seconds...",
    }).then((r) => {
        Downloader.downloadVideo(link, r.id, worker, msg.channel_id).then(async (path) => {
            await worker.api.messages.delete(msg.channel_id, r.id);
            const buffer = readFileSync(path);
            await worker.api.messages.sendFile(msg.channel_id, {
                buffer,
                name: `uTik-${msg.id}.mp4`,
            }, {
                content: "A de-Tok'd version of this video has arrived",
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
    
});

const link = "https://discord.com/api/oauth2/authorize?client_id=1031412241083416576&permissions=0&scope=bot";

worker.commands.prefix("/").add({
    command: "invite",
    exec: async (ctx): Promise<any> => {
        await ctx.reply(`You can invite the bot using [this invite link](${link})`);
    },
    interaction: {
        name: "invite",
        description: "Get the invite link for this bot.",
        options: [],
    },
});

worker.setStatus("watching" ,"for TikTok links", "online", "https://github.com/alexanderepolite/uTik");
