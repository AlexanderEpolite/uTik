import {exec, execFileSync} from "child_process";
import {statSync} from "fs";
import {Worker} from "discord-rose";
import {join} from "path";

export default class Downloader {
    
    private constructor() {}
    
    /**
     * Download a video from TT or other sites.
     * 
     * @param url {string} the URL of the video
     * @param identifier {string} the identifier of the video (usually the message ID)
     * @param worker {Worker} the worker
     * @param channel_id {string} the channel ID
     * @param crop {boolean} true/false to crop the video
     * @returns {Promise<string>} a string prefaced with /tmp/ that is the path to the downloaded file
     */
    public static async downloadVideo(url: string, identifier: string, worker: Worker, channel_id: string, crop: boolean): Promise<string> {
        
        //remove the & and everything after it
        url = url.split("&")[0] as string;
        
        //spawn a process for yt-dlp to download the video
        const command  = `yt-dlp -o /tmp/${identifier}.mp4 -f 'mp4' -S vcodec:h264 ${url}`;
        
        //i don't really care about the output.  when the process exits, the file is downloaded
        
        return new Promise((resolve, reject) => {
            exec(command, (error) => {
                if(error) {
                    reject(error);
                }
                
                if(crop) {
                    
                    const spawnpath = join(require.main?.path as string, "..", "cropper.bash");
                    console.log(`spawnpath: ${spawnpath}`);
                    
                    const sp = execFileSync(spawnpath, [identifier]).toString();
                    
                    //apparently the program exits with an error code on success...
                    // if(error) reject(error);
                    console.log(`out: ${sp}`);
                    
                    worker.api.messages.edit(channel_id, identifier, "Cropping video (this may take a few seconds)");
                    exec(`ffmpeg -i /tmp/${identifier}.mp4 -vf "${sp}" /tmp/${identifier}-crop.mp4`, (error) => {
                        if(error) {
                            reject(error);
                        }
                        
                        resolve(`/tmp/${identifier}-crop.mp4`);
                    });
                    
                    return;
                }
                
                //get the size of the file
                const stats = statSync(`/tmp/${identifier}.mp4`);
                
                //if file is greater than 24MB, compress it
                if(stats.size > 25165820) {
                    worker.api.messages.edit(channel_id, identifier, "Compressing video (this may take a few seconds)");
                    exec(`ffmpeg -i /tmp/${identifier}.mp4 -c:v libx264 -crf 30 -preset slow /tmp/${identifier}-cr.mp4`, (error) => {
                        if(error) {
                            reject(error);
                        }
                        
                        resolve(`/tmp/${identifier}-cr.mp4`);
                    });
                } else {
                    resolve(`/tmp/${identifier}.mp4`);
                }
                
            });
        });
    }
    
}
