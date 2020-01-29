module.exports = (client, message) => {
  if (message.author.bot)
    return;
  console.log('------------------------------------------');
  console.log("Event [messageDelete] triggered!");
    console.log('------------------------------------------');
  const Discord = require("discord.js");
  var logChannel = client.channels.get(client.config.logChannelID);

  if (message.content)
    if (message.content.length > 1024) {
      message.content = message.content.slice(0, 1021);
      message.content += "...";
    }

  var embed = new Discord.RichEmbed();
  embed .setTitle("Message deleted")
        .addField("Author", `<@${message.author.id}>`)
        .addField("Channel", `<#${message.channel.id}>`)
        .addField("Content", message.content?message.content:"*Embed message*")
        .setAuthor(`${message.author.username}#${message.author.discriminator}`, message.author.avatarURL)
        .setColor("RED");
  logChannel.send(embed).catch(console.error);
}
