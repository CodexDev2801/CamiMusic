const { MessageEmbed } = require('discord.js')

module.exports = {
    info: {
        name: "help",
        description: "Muestra todos los comandos",
        usage: "[command]",
        aliases: ["commands", "help me", "pls help", "ayuda"]
    },

    run: async function(client, message, args){
        var allcmds = "";

        client.commands.forEach(cmd => {
            let cmdinfo = cmd.info
            allcmds+="``"+client.config.prefix+cmdinfo.name+" "+cmdinfo.usage+"`` ~ "+cmdinfo.description+"\n"
        })

        let embed = new MessageEmbed()
        .setAuthor("Comando para "+client.user.username, "https://raw.githubusercontent.com/SudhanPlayz/Discord-MusicBot/master/assets/Music.gif")
        .setColor("BLUE")
        .setDescription(allcmds)
        .setFooter(`Para obtener información de cada comando escribe: ${client.config.prefix}help [comando] `)

        if(!args[0])return message.channel.send(embed)
        else {
            let cmd = args[0]
            let command = client.commands.get(cmd)
            if(!command)command = client.commands.find(x => x.info.aliases.includes(cmd))
            if(!command)return message.channel.send("Comando Desconocido")
            let commandinfo = new MessageEmbed()
            .setTitle("Comando: "+command.info.name+" info")
            .setColor("YELLOW")
            .setDescription(`
Nombre: ${command.info.name}
Descripción: ${command.info.description}
Uso: \`\`${client.config.prefix}${command.info.name} ${command.info.usage}\`\`
Alías: ${command.info.aliases.join(", ")}
`)
            message.channel.send(commandinfo)
        }
    }
}
