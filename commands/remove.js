const { MessageEmbed } = require("discord.js");
const sendError = require("../util/error");

module.exports = {
  info: {
    name: "remove",
    description: "Quita canciones de la cola de reproducción",
    usage: "rm <number>",
    aliases: ["rm"],
  },

  run: async function (client, message, args) {
   const queue = message.client.queue.get(message.guild.id);
    if (!queue) return sendError("No hay cola.",message.channel).catch(console.error);
    if (!args.length) return sendError(`Usa: ${client.config.prefix}\`remove <numero de la canción>\``);
    if (isNaN(args[0])) return sendError(`Usa: ${client.config.prefix}\`remove <numero de la cación>\``);
    if (queue.songs.length == 1) return sendError("There is no queue.",message.channel).catch(console.error);
    if (args[0] > queue.songs.length)
      return sendError(`La cola es solo para ${queue.songs.length} canciones largas!`,message.channel).catch(console.error);
try{
    const song = queue.songs.splice(args[0] - 1, 1); 
    sendError(`❌ **|** Removida: **\`${song[0].title}\`** de la cola.`,queue.textChannel).catch(console.error);
                   message.react("✅")
} catch (error) {
        return sendError(`:notes: Ha ocurrido un error inesperado.\nError posible: ${error}`, message.channel);
      }
  },
};
