import fetch from "node-fetch";

/**
 * Check to see if this is a real short or a normal video with the short prefix.
 * 
 * This can be tested using redirects.  YT always uses the "www" prefix, so
 * make sure that the url contains this or else real shorts will be marked.
 * 
 * @param url {string} the URL of the video
 * @returns {boolean} true if the video should be downloaded, false otherwise.
 */
export default async function checkYTShort(url: string): Promise<boolean> {
    const r = await fetch(url, {
        redirect: "manual",
    });
    
    //yt will return 303 on non-shorts urls
    return r.status === 200; 
}
