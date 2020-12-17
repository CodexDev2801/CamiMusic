const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "pause",
    description: "Pon en pausa la canción del server.",
    usage: "[pause]",
    aliases: ["pause"],
  },

  run: async function (client, message, args) {
    const serverQueue = message.client.queue.get(message.guild.id);
    if (serverQueue && serverQueue.playing) {
      serverQueue.playing = false;
	    try{
      serverQueue.connection.dispatcher.pause()
	  } catch (error) {
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: El reproductor se ha detenido y la cola se ha despejado.: ${error}`, message.channel);
      }	    
      let xd = new MessageEmbed()
      .setDescription("⏸ Pausó la música por ti!")
      .setColor("YELLOW")
      .setTitle("La música ha sido pausada!")
      return message.channel.send(xd);
    }
    return sendError("No hay nada sonando en este servidor.", message.channel);
  },
};
