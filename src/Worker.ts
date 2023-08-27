import {Worker} from "discord-rose";
import Downloader from "./util/Downloader";
import {readFileSync} from "fs";
import checkYTShort from "./util/checkYTShort";
import {ApplicationCommandOptionType} from "discord-api-types";

const worker = new Worker();

//https://(www).tiktok.com/t/abc123zyx
const REGEX_A = /https:\/\/(www\.)?tiktok\.com\/t\/(\w+)/;

//https://(www).tiktok.com/@user.name/video/123123123123
const REGEX_B = /https:\/\/(www\.)?tiktok\.com\/@([a-zA-Z\d._-]+)\/video\/(\w+)/;

//https://vm.tiktok.com/ABC123/
const REGEX_C = /https:\/\/vm\.tiktok\.com\/(\w+)\//;


//youtube shorts
//https://www.youtube.com/shorts/hJGtSwpOddQ
const YT_SHORT_REGEX = /https:\/\/(www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/;

//instagram
//https://instagram.com/stories/<user>/<a bunch of numbers>
const INSTAGRAM_STORY = /https:\/\/(www\.)?instagram\.com\/stories\/([A-Za-z0-9\-_\.]){2,30}\/([0-9]){2,30}/;

//https://www.instagram.com/reel/Cp_NdZoPuao
const INSTAGRAM_VIDEO_POST = /https:\/\/(www\.)?instagram\.com\/reel\/([A-Za-z0-9\-_]){5,30}/;

function download(link: string, channel_id: string, msg_id: string, initial_message_id: string, verb: string, crop: boolean) {
    Downloader.downloadVideo((link as string), initial_message_id, worker, channel_id, crop).then(async (path) => {
        
        await worker.api.messages.delete(channel_id, initial_message_id);
        
        const buffer = readFileSync(path);
        await worker.api.messages.sendFile(channel_id, {
            buffer,
            name: `www.uTik.me-${`${msg_id}`.substring(0, 6)}.mp4`,
        }, {
            content: `A ${verb} version of this video has arrived`,
            allowed_mentions: {
                parse: [],
            }
        });
    });
}

function matchLink(link: string) {
    return link.match(REGEX_A)
        || link.match(REGEX_B)
        || link.match(REGEX_C)
        || link.match(YT_SHORT_REGEX)
        || link.match(INSTAGRAM_STORY)
        || link.match(INSTAGRAM_VIDEO_POST);
}

async function checkAndDownload(content: string, channel_id: string, message_id: string, crop: boolean): Promise<boolean> {
    //check if the message contains a 'Tok link (note: the message
    //may contain text before or after the link)
    
    const match = matchLink(content);
    
    if(!match) return false;
    
    //get the link
    let link = match[0];
    
    if(!link) return false;
    
    if(link.includes("youtube")) {
        
        //youtube auto-redirects short links to be www.youtube.com instead of the bare URL.
        if(link.startsWith("https://youtube.com/shorts")) {
            link = link.replace("https://youtube.com", "https://www.youtube.com");
        }
        
        if(!await checkYTShort(link)) {
            await worker.api.messages.send(channel_id, "This does not appear to be a real YouTube Short URL.");
            return false;
        }
    }
    
    let verb: string;
    
    if(link.includes("tiktok")) {
        verb = "de-Tok'd";
    } else if(link.includes("youtube")) {
        verb = "de-Tube'd";
    } else if(link.includes("instagram")) {
        verb = "de-Gramm'd";
    } else {
        verb = "de-Tok'd";
    }
    
    worker.api.messages.send(channel_id, {
        content: `This video is being ${verb}, please wait a few seconds...`,
    }).then((r) => {
        link = link as string;
        download(link, r.channel_id, message_id, r.id, verb, crop);
    }).catch((reason) => {
        console.log(`could not download: ${reason}`);
    });
    
    return true;
    
}

worker.on("MESSAGE_CREATE", async (msg): Promise<any> => {
    
    if(msg.author.bot) return;
    
    await checkAndDownload(msg.content, msg.channel_id, msg.id, false);
});

//public bot invite link
const invite_link = "https://discord.com/api/oauth2/authorize?client_id=1031412241083416576&permissions=274878007296&scope=bot";

//commands
worker.commands.prefix("/").add({
    command: "invite",
    exec: async (ctx): Promise<any> => {
        await ctx.reply(`You can invite the bot using [this invite link](${invite_link})`);
    },
    interaction: {
        name: "invite",
        description: "Get the invite link for this bot.",
        options: [],
    },
}).add({
    command: "source",
    exec: async (ctx): Promise<any> => {
        await ctx.reply("View the source code and contribute to the repository here: [github.com/AlexanderEpolite/uTik](https://github.com/AlexanderEpolite/uTik?ref=bot)");
    },
    interaction: {
        name: "source",
        description: "Get the source code URI",
    },
}).add({
    command: "crop",
    exec: async (ctx): Promise<any> => {
        
        if(!ctx.guild || !ctx.channel) return;
        
        const link = ctx.options["link"];
        
        await ctx.reply("Processing.  A video will be posted in this channel shortly!");
        
        const r = await checkAndDownload(link, ctx.channel.id, ctx.interaction.id, true);
        
        if(!r) {
            return await worker.api.messages.send(ctx.channel.id, "Unable to download and crop this video :(");
        }
    },
    interaction: {
        name: "crop",
        description: "(EXPERIMENTAL): download and auto-crop a video",
        options: [
            {
                name: "link",
                description: "Link to the video",
                type: ApplicationCommandOptionType.String,
                required: true,
            },
        ],
    },
});

//set the bot status
worker.setStatus("listening" ,"TikTok/YT/Insta Links", "online");
