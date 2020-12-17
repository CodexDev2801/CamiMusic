const {
	Util,
	MessageEmbed
} = require("discord.js");
const ytdl = require("ytdl-core");
const yts = require("yt-search");
const ytdlDiscord = require("ytdl-core-discord");
var ytpl = require('ytpl');
const sendError = require("../util/error")
const fs = require('fs');

module.exports = {
	info: {
		name: "playlist",
		description: "Reproduce varias canciones",
		usage: "<YouTube Playlist URL | Nombre de la Playlist>",
		aliases: ["pl"],
	},

	run: async function (client, message, args) {
		const channel = message.member.voice.channel;
		if (!channel) return sendError("Lo siento, pero necesitas estar en un canal de voz para reproducir música.!", message.channel);
		const url = args[0] ? args[0].replace(/<(.+)>/g, "$1") : "";
		var searchString = args.join(" ");
		const permissions = channel.permissionsFor(message.client.user);
		if (!permissions.has("CONNECT")) return sendError("No puedo conectarme a su canal de voz, asegúrese de tener los permisos adecuados!", message.channel);
		if (!permissions.has("SPEAK")) return sendError("No puedo hablar en este canal de voz, asegúrese de tener los permisos adecuados!", message.channel);

		if (!searchString||!url) return sendError(`Usa: ${message.client.config.prefix}playlist <YouTube Playlist URL | Nombre de la Playlist>`, message.channel);
		if (url.match(/^https?:\/\/(www.youtube.com|youtube.com)\/playlist(.*)$/)) {
			try {
				const playlist = await ytpl(url.split("list=")[1]);
				if (!playlist) return sendError("No se ha encontrado la playlist", message.channel)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				return message.channel.send({
					embed: {
						color: "GREEN",
						description: `✅  **|**  Playlist: **\`${videos[0].title}\`** ha sido agregada a la cola de reproducción`
					}
				})
			} catch (error) {
				console.error(error);
				return sendError("Playlist no encontrada :(",message.channel).catch(console.error);
			}
		} else {
			try {
				var searched = await yts.search(searchString)

				if (searched.playlists.length === 0) return sendError("Parece que no pude encontrar la lista de reproducción en YouTube.", message.channel)
				var songInfo = searched.playlists[0];
				let listurl = songInfo.listId;
				const playlist = await ytpl(listurl)
				const videos = await playlist.items;
				for (const video of videos) {
					// eslint-disable-line no-await-in-loop
					await handleVideo(video, message, channel, true); // eslint-disable-line no-await-in-loop
				}
				let thing = new MessageEmbed()
					.setAuthor("Playlist agregada a la cola", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
					.setThumbnail(songInfo.thumbnail)
					.setColor("GREEN")
					.setDescription(`✅  **|**  Playlist: **\`${songInfo.title}\`** ha sido añadido \`${songInfo.videoCount}\` video a la cola`)
				return message.channel.send(thing)
			} catch (error) {
				return sendError("Ha ocurrido un error inesperado",message.channel).catch(console.error);
			}
		}

		async function handleVideo(video, message, channel, playlist = false) {
			const serverQueue = message.client.queue.get(message.guild.id);
			const song = {
				id: video.id,
				title: Util.escapeMarkdown(video.title),
				views: video.views ? video.views : "-",
				ago: video.ago ? video.ago : "-",
                                duration: video.duration,
				url: `https://www.youtube.com/watch?v=${video.id}`,
				img: video.thumbnail,
				req: message.author
			};
			if (!serverQueue) {
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

				try {
					var connection = await channel.join();
					queueConstruct.connection = connection;
					play(message.guild, queueConstruct.songs[0]);
				} catch (error) {
					console.error(`No pude unirme al canal de voz: ${error}`);
					message.client.queue.delete(message.guild.id);
					return sendError(`No pude unirme al canal de voz: ${error}`, message.channel);

				}
			} else {
				serverQueue.songs.push(song);
				if (playlist) return;
				let thing = new MessageEmbed()
					.setAuthor("Canción agregada a la cola", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
					.setThumbnail(song.img)
					.setColor("YELLOW")
					.addField("Nombre:", song.title, true)
					.addField("Duración:", song.duration, true)
					.addField("Pedida por:", song.req.tag, true)
					.setFooter(`Vistas:: ${song.views} | ${song.ago}`)
				return message.channel.send(thing);
			}
			return;
		}

async	function play(guild, song) {
			const serverQueue = message.client.queue.get(message.guild.id);
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
        if (serverQueue) {
        serverQueue.songs.shift();
        play(guild, serverQueue.songs[0]);
  	  return sendError(`Ha ocurrido un error inesperado.\nError posible \`${er}\``, message.channel)

         }
       }
     });
}
 
      serverQueue.connection.on("disconnect", () => message.client.queue.delete(message.guild.id));
			const dispatcher = serverQueue.connection
         .play(ytdl(song.url,{quality: 'highestaudio', highWaterMark: 1 << 25 ,type: "opus"}))
        .on("finish", () => {
            const shiffed = serverQueue.songs.shift();
            if (serverQueue.loop === true) {
                serverQueue.songs.push(shiffed);
            };
            play(guild, serverQueue.songs[0]);
        })

    dispatcher.setVolume(serverQueue.volume / 100);
let thing = new MessageEmbed()
				.setAuthor("Empezando a sonar!", "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
				.setThumbnail(song.img)
				.setColor("BLUE")
				.addField("Nombre:", song.title, true)
				.addField("Duración", song.duration, true)
				.addField("Pedida por:", song.req.tag, true)
				.setFooter(`Vistas: ${song.views} | ${song.ago}`)
    serverQueue.textChannel.send(thing);
}


	},



};
