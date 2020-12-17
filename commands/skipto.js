const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "skipto",
    description: "Saltar al número de cola seleccionado",
    usage: "skipto <number>",
    aliases: ["st"],
  },

  run: async function (client, message, args) {
    if (!args.length || isNaN(args[0]))
      return message.channel.send({
                        embed: {
                            color: "GREEN",
                            description: `**Usa**: \`${client.config.prefix}skipto <numero>\``
                        }
   
                   }).catch(console.error);
        

    const queue = message.client.queue.get(message.guild.id);
    if (!queue) return sendError("No hay cola.",message.channel).catch(console.error);
    if (args[0] > queue.songs.length)
      return sendError(`La cola es solo para ${queue.songs.length} canciones largas!`,message.channel).catch(console.error);

    queue.playing = true;

    if (queue.loop) {
      for (let i = 0; i < args[0] - 2; i++) {
        queue.songs.push(queue.songs.shift());
      }
    } else {
      queue.songs = queue.songs.slice(args[0] - 2);
    }
     try{
    queue.connection.dispatcher.end();
      }catch (error) {
        queue.voiceChannel.leave()
        message.client.queue.delete(message.guild.id);
       return sendError(`:notes: TEl reproductor se ha detenido y la cola se ha despejado.: ${error}`, message.channel);
      }
    
    queue.textChannel.send({
                        embed: {
                            color: "GREEN",
                            description: `${message.author} ⏭ salto \`${args[0] - 1}\` canciones`
                        }
   
                   }).catch(console.error);
                   message.react("✅")

  },
};
