const { Util, MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "skip",
    description: "Para omitir la música actual",
    usage: "",
    aliases: ["s"],
  },

  run: async function (client, message, args) {
    const channel = message.member.voice.channel
    if (!channel)return sendError("Lo siento, pero necesitas estar en un canal de voz para reproducir música.!", message.channel);
    const serverQueue = message.client.queue.get(message.guild.id);
    if (!serverQueue)return sendError("No hay nada reproduciendo que pueda saltar por ti.", message.channel);
        if(!serverQueue.connection)return
if(!serverQueue.connection.dispatcher)return
     if (serverQueue && !serverQueue.playing) {
      serverQueue.playing = true;
      serverQueue.connection.dispatcher.resume();
      let xd = new MessageEmbed()
      .setDescription("▶ Reanudada la música por ti!")
      .setColor("YELLOW")
      .setTitle("Se reanudó la música!")
       
   return message.channel.send(xd).catch(err => console.log(err));
      
    }


       try{
      serverQueue.connection.dispatcher.end()
      } catch (error) {
        serverQueue.voiceChannel.leave()
        message.client.queue.delete(message.guild.id);
        return sendError(`:notes: El reproductor se ha detenido y la cola se ha despejado.: ${error}`, message.channel);
      }
    message.react("✅")
  },
};
