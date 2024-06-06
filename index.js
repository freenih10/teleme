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
  // Ambil argumen setelah perintah, misalnya angka '5' dari '/apkru 5'
  const input = ctx.message.text.split(" ");
  const count = input[1] ? parseInt(input[1]) : 10; // Jika tidak ada angka, gunakan nilai default 10

  // Batasi jumlah maksimum hasil yang ditampilkan
  const maxResults = Math.min(count, 10);

  try {
    const response = await axios.get("https://apkru.vercel.app/apkru");
    const result = response.data;

    // Tampilkan hanya jumlah hasil yang diminta
    for (let i = 0; i < maxResults; i++) {
      const item = result[i];
      if (!item) break; // Jika tidak ada lebih banyak hasil, hentikan loop

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

      // Tambahkan setiap link download ke pesan
      item.download.forEach((download) => {
        message += `<a href="${download.url}">${download.title}</a>`;
      });

      await ctx.telegram.sendChatAction(ctx.chat.id, "upload_photo");
      // Kirim pesan dengan foto dan informasi download
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

module.exports = (req, res) => {
  bot.handleUpdate(req.body, res);
  return res.status(200).end();
};

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
