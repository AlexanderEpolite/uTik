import {exec} from "child_process";

const fetch = require("node-fetch");

/**
 * Check the current yt-dlp version to make sure that it is up-to-date
 * 
 * @returns {boolean} true if it is up to date, false otherwise.
 */
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
