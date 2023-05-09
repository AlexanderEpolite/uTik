import fetch from "node-fetch";

/**
 * 
 * @param url
 * @returns {boolean} true if the video should be downloaded, false otherwise.
 */
export default async function checkYTShort(url: string): Promise<boolean> {
    const r = await fetch(url, {
        redirect: "manual",
    });
    
    //yt will return 303 on non-shorts urls
    return r.status === 200; 
}
