# μTik

![eyebrow](https://raw.githubusercontent.com/alexanderepolite/uTik/master/demo.png)

Discord bot which automatically downloads TikTok videos when a TikTok link is posted in chat.

## Invite the bot

You can invite the bot [using this link](https://discord.com/api/oauth2/authorize?client_id=1031412241083416576&permissions=0&scope=bot)

## Usage

Make sure [yt-dlp](https://github.com/yt-dlp/yt-dlp) is installed and accessible from the path.

Create `secrets.json` in the same directory as this file with the following data:
```json
{
    "token": "YOUR_DISCORD_BOT_TOKEN"
}
```

Install dependencies with `npm i`, run, compile with `tsc`, and run `dist/uTik.js` to start the bot.
