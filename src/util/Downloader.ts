import {exec} from "child_process";
import {Worker} from "discord-rose";
import crop from "./ffmpegUtils/crop";
import compress from "./ffmpegUtils/compress";



export default class Downloader {
    
    /**
     * Download a video from TT or other sites.
     * 
     * @param url {string} the URL of the video
     * @param identifier {string} the identifier of the video (usually the message ID)
     * @param worker {Worker} the worker
     * @param channel_id {string} the channel ID
     * @param crop_video {boolean} true/false to crop the video
     * @returns {Promise<string>} a string prefaced with /tmp/ that is the path to the downloaded file
     */
    public static async downloadVideo(url: string, identifier: string, worker: Worker, channel_id: string, crop_video: boolean): Promise<string> {
        
        //remove the & and everything after it (these are usually trackers and might mess up yt-dlp)
        url = url.split("&")[0] as string;
        
        //spawn a process for yt-dlp to download the video
        const command  = `yt-dlp -o /tmp/${identifier}.mp4 -f 'mp4' -S vcodec:h264 ${url}`;
        
        return new Promise((resolve, reject) => {
            //download initial file from website
            exec(command, (error) => {
                if(error) {
                    reject(error);
                }
                
                //if cropping is enabled, run that through FFMPEG
                if(crop_video) {
                    crop(identifier, channel_id, worker, resolve, reject);
                } else { //attempt compressing
                    compress(identifier, channel_id, worker, resolve, reject);
                }
                
            });
        });
    }
    
}
