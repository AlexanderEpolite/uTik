import {Worker} from "discord-rose";
import {exec} from "child_process";
import {statSync} from "fs";

/**
 * Compress a video if it is over 24 MB (Discord has a hard limit of 25 MB, best to be under that).
 * 
 * @param identifier {string} a unique identifier of the video (usually the message/interaction ID).
 * @param channel_id {string} the channel where the originating message was sent
 * @param worker {string} the Discord Worker
 * @param resolve {Function} on resolve
 * @param reject {Function} on reject
 * 
 * @returns {void}
 */
export default function compress(identifier: string, channel_id: string, worker: Worker, resolve: Function, reject: Function): void {

    //get the size of the file
    const stats = statSync(`/tmp/${identifier}.mp4`);

    //if file is greater than 24MB, compress it
    if(stats.size > 25165820) {
        !identifier.includes(".") && worker.api.messages.edit(channel_id, identifier, "Compressing video (this may take a few seconds)");
        exec(`ffmpeg -i /tmp/${identifier}.mp4 -c:v libx264 -crf 30 -preset slow /tmp/${identifier}-cr.mp4`, (error) => {
            if(error) {
                reject(error);
            }

            resolve(`/tmp/${identifier}-cr.mp4`);
        });
    } else {
        resolve(`/tmp/${identifier}.mp4`);
    }

}
