const { Util, MessageEmbed } = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytdlDiscord = require("ytdl-core-discord");
const YouTube = require("youtube-sr");
const sendError = require("../util/error")
const fs = require('fs');

module.exports = {
  info: {
    name: "search",
    description: "Busca canciones",
    usage: "<song_name>",
    aliases: ["sc"],
  },

  run: async function (client, message, args) {
    let channel = message.member.voice.channel;
    if (!channel)return sendError("Lo siento, pero necesitas estar en un canal de voz para reproducir música.!", message.channel);

    const permissions = channel.permissionsFor(message.client.user);
    if (!permissions.has("CONNECT"))return sendError("No puedo conectarme a su canal de voz, asegúrese de tener los permisos adecuados!", message.channel);
    if (!permissions.has("SPEAK"))return sendError ("No puedo hablar en este canal de voz, asegúrese de tener los permisos adecuados!", message.channel);

    var searchString = args.join(" ");
    if (!searchString)return sendError("Necesitas introducir algo a buscar", message.channel);

    var serverQueue = message.client.queue.get(message.guild.id);
    try {
           var searched = await YouTube.search(searchString, { limit: 10 });
          if (searched[0] == undefined)return sendError("Parece que no pude encontrar la canción en YouTube.", message.channel);
                    let index = 0;
                    let embedPlay = new MessageEmbed()
                        .setColor("BLUE")
                        .setAuthor(`Resultados para \"${args.join(" ")}\"`, message.author.displayAvatarURL())
                        .setDescription(`${searched.map(video2 => `**\`${++index}\`  |** [\`${video2.title}\`](${video2.url}) - \`${video2.durationFormatted}\``).join("\n")}`)
                        .setFooter("Escriba el número de la canción para agregarla a la lista de reproducción");
                    // eslint-disable-next-line max-depth
                    message.channel.send(embedPlay).then(m => m.delete({
                        timeout: 15000
                    }))
                    try {
                        var response = await message.channel.awaitMessages(message2 => message2.content > 0 && message2.content < 11, {
                            max: 1,
                            time: 20000,
                            errors: ["time"]
                        });
                    } catch (err) {
                        console.error(err);
                        return message.channel.send({
                            embed: {
                                color: "RED",
                                description: "No se ha seleccionado nada en 20 segundos, la solicitud ha sido cancelada."
                            }
                        });
                    }
                    const videoIndex = parseInt(response.first().content);
                    var video = await (searched[videoIndex - 1])
		    
                } catch (err) {
                    console.error(err);
                    return message.channel.send({
                        embed: {
                            color: "RED",
                            description: "🆘  **|**  No pude obtener ningún resultado de búsqueda"
                        }
                    });
                }
            
            response.delete();
  var songInfo = video

    const song = {
      id: songInfo.id,
      title: Util.escapeMarkdown(songInfo.title),
      views: String(songInfo.views).padStart(10, ' '),
      ago: songInfo.uploadedAt,
      duration: songInfo.durationFormatted,
      url: `https://www.youtube.com/watch?v=${songInfo.id}`,
      img: songInfo.thumbnail.url,
      req: message.author
    };

    if (serverQueue) {
      serverQueue.songs.push(song);
      let thing = new MessageEmbed()
      .setAuthor("La canción ha sido agregada a la cola", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      .setThumbnail(song.img)
      .setColor("YELLOW")
      .addField("Nombre:", song.title, true)
      .addField("Duración:", song.duration, true)
      .addField("Pedida por:", song.req.tag, true)
      .setFooter(`Vistas: ${song.views} | ${song.ago}`)
      return message.channel.send(thing);
    }

   const queueConstruct = {
      textChannel: message.channel,
      voiceChannel: channel,
      connection: null,
      songs: [],
      volume: 80,
      playing: true,
      loop: false
    };
    message.client.queue.set(message.guild.id, queueConstruct);
    queueConstruct.songs.push(song);

    const play = async (song) => {
      const queue = message.client.queue.get(message.guild.id);
      let afk = JSON.parse(fs.readFileSync("./afk.json", "utf8"));
       if (!afk[message.guild.id]) afk[message.guild.id] = {
        afk: false,
    };
    var online = afk[message.guild.id]
    if (!song){
      if (!online.afk) {
        sendError("Saliendo del canal de voz porque creo que no hay canciones en la cola. Si te gusta el bot, quédate 24 horas al día, 7 días a la semana en el canal de voz, ejecuta `!afk`", message.channel)
        message.guild.me.voice.channel.leave();//If you want your bot stay in vc 24/7 remove this line :D
        message.client.queue.delete(message.guild.id);
      }
            return message.client.queue.delete(message.guild.id);
}
let stream = null; 
    if (song.url.includes("youtube.com")) {
      
      stream = await ytdl(song.url);
stream.on('error', function(er)  {
      if (er) {
        if (queue) {
        queue.songs.shift();
        play(queue.songs[0]);
  	  return sendError(`Ha ocurrido un error inesperado.\nError posible \`${er}\``, message.channel)

       }
      }
    });  
}
 
    queue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
      const dispatcher = queue.connection
         .play(ytdl(song.url, {quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
      .on("finish", () => {
           const shiffed = queue.songs.shift();
            if (queue.loop === true) {
                queue.songs.push(shiffed);
            };
          play(queue.songs[0]);
        })

      dispatcher.setVolumeLogarithmic(queue.volume / 100);
      let thing = new MessageEmbed()
      .setAuthor("Empezando a sonar!", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
      .setThumbnail(song.img)
      .setColor("BLUE")
      .addField("Nombre:", song.title, true)
      .addField("Duración", song.duration, true)
      .addField("Pedida por:", song.req.tag, true)
      .setFooter(`Vistas: ${song.views} | ${song.ago}`)
      queue.textChannel.send(thing);
    };

    try {
      const connection = await channel.join();
      queueConstruct.connection = connection;
      channel.guild.voice.setSelfDeaf(true)
      play(queueConstruct.songs[0]);
    } catch (error) {
      console.error(`No pude unirme al canal de voz: ${error}`);
      message.client.queue.delete(message.guild.id);
      await channel.leave();
      return sendError(`No pude unirme al canal de voz: ${error}`, message.channel);
    }
 
  },

};
