exports.run = (client, message, args) => {
  if(!args || args.length === 0) {
    message.channel.send("Too few arguments!").catch(console.error);
    return;
  }
    let rMember = message.guild.members.get(args[0]); //Gets the user
    if (!rMember) return message.reply("That user does not exist.");

    rMember.removeRoles(rMember.roles.keyArray()).then(console.log).catch(console.error); //Removes all roles
    rMember.addRole("621380146976522290"); //Adds Guests Role

    let Discord = require('discord.js');

    let embed  = new Discord.RichEmbed()
    .setColor("RANDOM")
    .setDescription("Member guested!")
    .setFooter('Made by MrTomato#9412', 'https://cdn.discordapp.com/avatars/337266897458429956/d1b2120e8ea7e51165ea90f31d3950f8.png?size=128');

    message.channel.send(embed).catch(console.error);
}
