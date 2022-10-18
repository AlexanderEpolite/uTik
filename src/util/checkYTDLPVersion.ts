import {exec} from "child_process";

const fetch = require("node-fetch");

export default async function(): Promise<boolean> {
    return new Promise(async (resolve, reject) => {
        
        const data = (await (await fetch("https://api.github.com/repos/yt-dlp/yt-dlp/tags")).json());
        
        const version = data[0].name as string;
        
        exec("yt-dlp --version", (error, stdout) => {
            if(error) {
                reject(error);
            }
            
            resolve(stdout.includes(version));
        });
    });
}
