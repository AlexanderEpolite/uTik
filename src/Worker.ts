import {Worker} from "discord-rose";
import Downloader from "./util/Downloader";
import {readFileSync} from "fs";
import checkYTShort from "./util/checkYTShort";
import {ApplicationCommandOptionType} from "discord-api-types";
import matchLink from "./util/matchLink";

const worker = new Worker();

function download(link: string, channel_id: string, msg_id: string, initial_message_id: string | undefined, verb: string, crop: boolean) {
    
    if(!initial_message_id) {
        initial_message_id = "" + Math.random() + "" + Math.random();
    }
    
    Downloader.downloadVideo((link as string), initial_message_id, worker, channel_id, crop).then(async (path) => {
        
        try {
            //I would have a variable indicating if this should delete the message...
            //unfortunately JavaScript asynchronous functions do not like that, so here we are.
            worker.api.messages.delete(channel_id, initial_message_id as string)
                .catch(() => {})
                .then(() => {});
        } catch(e) {}
        
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



async function checkAndDownload(content: string, channel_id: string, message_id: string, crop: boolean): Promise<boolean> {
    //check if the message contains a 'Tok link (note: the message
    //may contain text before or after the link)
    
    const match = matchLink(content);
    
    if(!match) return false;
    
    //get the link
    let link = match[0];
    
    if(!link) return false;
    
    let download_notify = true;
    
    if(link.includes("instagram")) {
        //auto-crop IG links unless the message contains "nocrop"
        crop = !content.includes("nocrop");
        
        //replace /p/ with /reel/.  If this is a normal post, it will not
        //download.  If it is really a video, it will download, but don't
        //notify the user since it may not be a real post.  Might change
        //this function later to detect videos and reels from normal posts
        if(link.includes("/p/")) {
            link = link.replace("/p/", "/reel/");
            download_notify = false;
        }
    }
    
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
    
    try {
        //do not notify on normal IG post links because all
        //the /reel/ links are /p/, but not all /p/ are /reel/.
        
        let bot_message_id: string | undefined = undefined;
        
        //notify the user that the download has started
        if(download_notify) {
            const r = await worker.api.messages.send(channel_id, {
                content: `This video is being ${verb}, please wait a few seconds...`,
            });
            
            bot_message_id = r.id;
        }
        
        //download the video.  This will handle editing and notifying
        download(link, channel_id, message_id, bot_message_id, verb, crop);
    } catch(e) {
        console.log(`could not download: ${e}`);
    }
    
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
        
        //crop non-IG videos.  IG videos are cropped automatically.
        
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
worker.setStatus("watching" ,"TikTok/YT/Insta Links", "online");
