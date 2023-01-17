const Telegraf = require("telegraf");
const ytdl = require("ytdl-core");
require("dotenv").config();

const token = process.env.TELEGRAM_BOT_TOKEN;
const bot = new Telegraf(token);
var videoChunkList = [];
var formatOptions = [];

const createFormatKeyBoard = (formatList) => {
  const keyBoardContent = formatList.map((el) => {
    return { text: el, callback_data: el };
  });
  return {
    reply_markup: {
      inline_keyboard: [keyBoardContent],
    },
  };
};

const getVideoUrl = async (url, chatId) => {
  try {
    const info = await ytdl.getInfo(url);
    info.formats.forEach((chunk) => {
      if (chunk.hasVideo && chunk.hasAudio) {
        formatOptions.push("format: " + chunk.qualityLabel);
        videoChunkList.push(chunk);
      } else if (
        chunk.hasAudio &&
        !chunk.hasVideo &&
        chunk.mimeType.includes("audio/mp4")
      ) {
        formatOptions.push("format: " + "mp3");
        videoChunkList.push(chunk);
      }
    });
    const formatButtons = createFormatKeyBoard(formatOptions);
    bot.telegram.sendMessage(
      chatId,
      "Choose video or audio format : ",
      formatButtons
    );
  } catch (error) {
    bot.telegram.sendMessage(chatId, "Sorry no video found...");
    console.log(error.message);
  }
};

//starting block
bot.command("start", (ctx) => {
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Welcome to YouTube video downloder, created By Pranav"
  );
});

bot.hears(/\/url/, async (ctx) => {
  const url = ctx.match.input.split(" ")[1];
  bot.telegram.sendMessage(
    ctx.chat.id,
    "Please wait while we are processing your link..."
  );
  formatOptions = [];
  await getVideoUrl(url, ctx.chat.id);
});

bot.action(/^format: ([A-z0-9]+)$/, (ctx) => {
  const chatId = ctx.chat.id;
  const format = ctx.match[1];
  videoChunkList.forEach((chunk) => {
    const keyboard = {
      reply_markup: {
        inline_keyboard: [[{ text: "Open In Browser", url: chunk.url }]],
      },
    };
    if (format === "mp3" && chunk.qualityLabel === null) {
      bot.telegram.sendMessage(chatId, "Here is the link 😃", keyboard);
      bot.telegram.sendMessage(chatId, chunk.url, kbrd);
      formatOptions = [];
      videoChunkList = [];
    } else if (chunk.qualityLabel === format) {
      bot.telegram.sendMessage(chatId, "Here is the link 😃", keyboard);
      formatOptions = [];
      videoChunkList = [];
    }
  });
});

bot.action("help", (ctx) => {
  let userMessage = `Use the correct format to get the video.\nExample: /url https://www.youtube.com/watch?v=VIDEO_ID`;
  // ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, userMessage);
});

bot.action("botInfo", (ctx) => {
  let userMessage = `This bot is created by Pranav, here you can download any youtube video from its url.`;
  // ctx.deleteMessage();
  bot.telegram.sendMessage(ctx.chat.id, userMessage, {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "Repository link",
            url: "https://github.com/Pranav108/yt-telegramBot",
          },
        ],
      ],
    },
  });
});

bot.command("hello", (ctx) => {
  bot.telegram.sendMessage(ctx.chat.id, "Are you looking for these..?", {
    reply_markup: {
      inline_keyboard: [
        [{ text: "botInfo", callback_data: "botInfo" }],
        [{ text: "help", callback_data: "help" }],
      ],
    },
  });
});

bot.on("text", (ctx) =>
  ctx.reply(`I'm unfemelier with this, plese use /hello for more info.`)
);
bot.launch();
