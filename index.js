const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");
const FormData = require("form-data");
const fs = require("fs");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(`
List Command:

/hdimg - Create your image hd
/removebg - Remove background image
`)
);

//  const apiResponse = await axios.get(
//                 `https://api.nyxs.pw/tools/hd?url=${localFileUrl}`
//             );

const commandResponses = {
  "/hdimg": {
    response: "Image HD sedang diproses...",
    handler: async (ctx) => {
      try {
        const photoArray = ctx.message.photo;
        const fileId = photoArray[photoArray.length - 1].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

        const formData = new FormData();
        formData.append("image", fileUrl);

        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?expiration=1800&key=${process.env.API_IMGBB}`,
          formData,
          {
            headers: {
              ...formData.getHeaders(),
            },
          }
        );

        const imgbbData = imgbbResponse.data.data;

        const hdResponse = await axios.get(
          `https://api.nyxs.pw/tools/hd?url=${imgbbData.url}`,
          {
            responseType: "arraybuffer",
          }
        );

        await ctx.telegram.sendPhoto(ctx.chat.id, { source: hdResponse.data });
        await ctx.telegram.sendMessage(
          "6312194526",
          "Ada yang gunain tools HD IMAGE"
        );
        await ctx.telegram.sendPhoto("6312194526", {
          source: removeBgResponse.data,
        });
        ctx.reply("Gambar berhasil diproses.");
      } catch (error) {
        console.error("Error:", error);
        if (error.response) {
          console.error("Error response data:", error.response.data);
        }
        ctx.reply("Terjadi kesalahan saat memproses gambar.");
      }
    },
  },

  "/removebg": {
    response: "Remove background sedang diproses...",
    handler: async (ctx) => {
      try {
        const photoArray = ctx.message.photo;
        const fileId = photoArray[photoArray.length - 1].file_id;
        const file = await ctx.telegram.getFile(fileId);
        const fileUrl = `https://api.telegram.org/file/bot${process.env.BOT_TOKEN}/${file.file_path}`;

        // Upload gambar ke ImgBB
        const formDataImgBB = new FormData();
        formDataImgBB.append("image", fileUrl);

        const imgbbResponse = await axios.post(
          `https://api.imgbb.com/1/upload?expiration=1800&key=${process.env.API_IMGBB}`,
          formDataImgBB,
          {
            headers: {
              ...formDataImgBB.getHeaders(),
            },
          }
        );

        const imgbbData = imgbbResponse.data.data;
        const removeBgResponse = await axios.get(
          `https://api.nyxs.pw/tools/removebg?url=${imgbbData.url}`,
          {
            responseType: "arraybuffer",
          }
        );

        await ctx.telegram.sendPhoto(ctx.chat.id, {
          source: removeBgResponse.data,
        });
        await ctx.telegram.sendMessage(
          "6312194526",
          "Ada yang gunain tools Remove Background"
        );
        await ctx.telegram.sendPhoto("6312194526", {
          source: removeBgResponse.data,
        });

        ctx.reply("Gambar tanpa latar belakang berhasil diproses.");
      } catch (error) {
        console.error("Error:", error);
        ctx.reply("Terjadi kesalahan saat menghapus latar belakang gambar.");
      }
    },
  },
};

bot.on("photo", async (ctx) => {
  const caption = ctx.message.caption ? ctx.message.caption.toLowerCase() : "";
  const command = commandResponses[caption];
  if (command) {
    const message = await ctx.reply(command.response);
    if (command.handler) {
      await command.handler(ctx);
      await ctx.telegram.deleteMessage(ctx.chat.id, message.message_id);
    }
  } else {
    await ctx.reply("Perintah tidak dikenali.");
  }
});

bot.launch();

module.exports = (req, res) => {
  bot.handleUpdate(req.body, res);
  return res.status(200).end();
};

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
