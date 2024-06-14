const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");
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
  "/hdimage": {
    response: "Ini adalah pesan respons untuk perintah /hdimage.",
    handler: async (ctx) => {
      // Logika khusus untuk /hdimage di sini
      await ctx.reply("Mengirimkan gambar definisi tinggi...");
    },
  },
  "/removebg": {
    response: "Ini adalah pesan respons untuk perintah /removebg.",
    handler: async (ctx) => {
      // Logika khusus untuk /removebg di sini
      await ctx.reply("Menghapus latar belakang gambar...");
    },
  },
  // Tambahkan perintah lainnya dengan respons masing-masing di sini
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
    // Menghapus pesan respons setelah penanganan selesai
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
