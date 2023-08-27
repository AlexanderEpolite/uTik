
//https://(www).tiktok.com/t/abc123zyx
const REGEX_A = /https:\/\/(www\.)?tiktok\.com\/t\/(\w+)/;

//https://(www).tiktok.com/@user.name/video/123123123123
const REGEX_B = /https:\/\/(www\.)?tiktok\.com\/@([a-zA-Z\d._-]+)\/video\/(\w+)/;

//https://vm.tiktok.com/ABC123/
const REGEX_C = /https:\/\/vm\.tiktok\.com\/(\w+)\//;


//youtube shorts
//https://www.youtube.com/shorts/hJGtSwpOddQ
const YT_SHORT_REGEX = /https:\/\/(www\.)?youtube\.com\/shorts\/([A-Za-z0-9_-]{11})/;

//instagram
//https://instagram.com/stories/<user>/<a bunch of numbers>
const INSTAGRAM_STORY = /https:\/\/(www\.)?instagram\.com\/stories\/([A-Za-z0-9\-_\.]){2,30}\/([0-9]){2,30}/;

//https://www.instagram.com/reel/Cp_NdZoPuao
const INSTAGRAM_VIDEO_POST = /https:\/\/(www\.)?instagram\.com\/reel\/([A-Za-z0-9\-_]){5,30}(\/)?/;

//https://www.instagram.com/p/Cp_NdZoPuao/
const INSTAGRAM_POST = /https:\/\/(www\.)?instagram\.com\/p\/([A-Za-z0-9\-_]){5,30}(\/)?/;

export default function matchLink(link: string) {
    return link.match(REGEX_A)
        || link.match(REGEX_B)
        || link.match(REGEX_C)
        || link.match(YT_SHORT_REGEX)
        || link.match(INSTAGRAM_STORY)
        || link.match(INSTAGRAM_VIDEO_POST)
        || link.match(INSTAGRAM_POST);
}
