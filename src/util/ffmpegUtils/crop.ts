import {join} from "path";
import {exec, execFileSync} from "child_process";
import {Worker} from "discord-rose";
import compress from "./compress";

/**
 * Crop a video using FFMPEG.
 * This is useful when the video has black borders around it which should be cropped out.
 * Otherwise, people will have to do this themselves.  Obviously, this is not perfect,
 * but it gets 90% of them.
 * 
 * @param identifier {string} a unique identifier for the download (usually the message or interaction ID)
 * @param channel_id {string} the Discord channel ID where the original message was sent
 * @param worker {Worker} the Discord Worker
 * @param resolve {Function} on resolve
 * @param reject {Function} on reject
 * 
 * @returns {void}
 */
export default function crop(identifier: string, channel_id: string, worker: Worker, resolve: Function, reject: Function): void {
    const spawnpath = join(require.main?.path as string, "..", "cropper.bash");

    let sp = execFileSync(spawnpath, [identifier]).toString();

    //apparently the program exits with an error code on success...
    // if(error) reject(error);
    console.log(`out: ${sp}`);

    //subtract 5 pixels from the four dimensions for padding (unless its 4 or less)
    //this makes the video look nicer (in the case of text on the top)
    let v = sp.split("=")[1]?.split(":") as string[];

    for(let i = 0; i < v.length; i++) {
        v[i] = "" + Math.max(Number(v[i]) - 5, 0);
    }

    //new pixel ranges
    sp = "crop=" + v.join(":");

    !identifier.includes(".") && worker.api.messages.edit(channel_id, identifier, "Cropping video (this may take a few seconds)");
    exec(`ffmpeg -i /tmp/${identifier}.mp4 -vf "${sp}" /tmp/${identifier}-crop.mp4`, (error) => {
        if(error) {
            reject(error);
        }

        compress(identifier + "crop", channel_id, worker, resolve, reject);
    });

    return;
}
