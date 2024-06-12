const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) =>
  ctx.reply(`
List Command:

/apkru + angka 1-10 - Menampilkan aplikasi mod dari Androeed.ru (example: /apkru 5)
`)
);

bot.command("apkru", async (ctx) => {
  const input = ctx.message.text.split(" ");
  const count = input[1] ? parseInt(input[1]) : 10;

  const maxResults = Math.min(count, 10);

  try {
    const response = await axios.get("https://apkru.vercel.app/apkru");
    const result = response.data;

    for (let i = 0; i < maxResults; i++) {
      const item = result[i];
      if (!item) break;

      let message = `
Nama: 
<code>${item.title}</code>

Size: 
<code>${item.size}</code>

Date: 
<code>${item.date}</code>

Version: 
<code>${item.version}</code>

Link: 
${item.url}

Download:
`;
      item.download.forEach((download) => {
        message += `<a href="${download.url}">${download.title}</a>`;
      });

      await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
      await ctx.replyWithPhoto(item.img, {
        caption: message,
        parse_mode: "HTML",
      });
    }
  } catch (error) {
    console.error(error);
    ctx.reply("Terjadi kesalahan saat mengambil data.");
  }
});
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
