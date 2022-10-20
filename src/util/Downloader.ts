import {exec} from "child_process";

export default class Downloader {
    
    private constructor() {}
    
    /**
     * Download a video from Tok
     * 
     * @param url the URL of the video
     * @param identifier the identifier of the video
     * @returns {Promise<string>} a string prefaced with /tmp/ that is the path to the downloaded file
     */
    public static async downloadVideo(url: string, identifier: string): Promise<string> {
        
        //spawn a process for yt-dlp to download the video
        const command  = `yt-dlp -o /tmp/${identifier}.mp4 -f 'bestvideo[ext=mp4]+bestaudio[ext=m4a]/mp4' -S vcodec:h264 ${url}`;
        
        //i don't really care about the output.  when the process exits, the file is downloaded
        
        return new Promise((resolve, reject) => {
            exec(command, (error) => {
                if(error) {
                    reject(error);
                }
                resolve(`/tmp/${identifier}.mp4`);
            });
        });
    }
    
}
