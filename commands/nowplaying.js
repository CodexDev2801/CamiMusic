const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error")

module.exports = {
  info: {
    name: "nowplaying",
    description: "Muestra la canción que sonando.",
    usage: "",
    aliases: ["np"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue) return sendError("No hay nada sonando en este servidor..", message.channel);
    let song = serverQueue.songs[0]
    let thing = new MessageEmbed()
      .setAuthor("Sonando:", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      .setThumbnail(song.img)
      .setColor("BLUE")
      .addField("Nombre:", song.title, true)
      .addField("Duración:", song.duration, true)
      .addField("Pedido por:", song.req.tag, true)
      .setFooter(`Vistas: ${song.views} | ${song.ago}`)
    return message.channel.send(thing)
  },
};
