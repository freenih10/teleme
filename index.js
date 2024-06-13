const { Telegraf } = require("telegraf");
const { message } = require("telegraf/filters");
const axios = require("axios");
const FormData = require("form-data");
require("dotenv").config();

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start(ctx =>
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
        response: "Image HD sedang di proses...",
        handler: async ctx => {
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
                        headers: { ...formData.getHeaders() }
                    }
                );

                const imgbbData = imgbbResponse.data.data;

                const hdResponse = await axios.get(
                    `https://api.nyxs.pw/tools/hd?url=${imgbbData.url}`
                );

                await ctx.sendPhoto(
                    ctx.chat.id,
                    `https://api.nyxs.pw/tools/hd?url=${imgbbData.url}`
                );

              await  ctx.reply("Image HD berhasil dikirim.");
            } catch (error) {
                console.error("Error:", error.message);
                ctx.reply("Terjadi kesalahan saat memproses gambar.");
            }
        }
    },

    "/removebg": {
        response: "Remove background sedanf di proses...",
        handler: async ctx => {
            // Logika khusus untuk /removebg di sini
            await ctx.reply("Menghapus latar belakang gambar...");
        }
    }
};
bot.on("photo", async ctx => {
    const caption = ctx.message.caption
        ? ctx.message.caption.toLowerCase()
        : "";
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
