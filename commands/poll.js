exports.run = (client, message, args) => {
  // MADE BY MrTomato#9412 mrtomatolegit@gmail.com
  // FIXED BY Foxyy#6587 ryanfoxgaming@gmail.com
  const { RichEmbed } = require('discord.js');
  args = (args.toString())
  for (let i; args.includes(',');) {
  args = (args.replace(',', ' '))
  }
  if (!args || args.length < 1) {
    message.channel.send('Please tell me something to args!').then(msg => {
      msg.delete(5000)
    })
    return
  }
  console.log(args)
  message.channel.send(
  new RichEmbed()
  // Set the title of the field
  .setAuthor(message.author.username + ' asked a question!!!')
  .setTimestamp()
  .setFooter('Made by MrTomato#9412', 'https://cdn.discordapp.com/avatars/337266897458429956/d1b2120e8ea7e51165ea90f31d3950f8.png?size=128')
  .addField('Vote ✅ for yes', '^^^^^^^^^^^^^^^', true)
  .addField('Vote ❎ for no', '^^^^^^^^^^^^^^', true)
  // Set the color of the embed
  .setColor(0x00FF00)
  // Set the main content of the embed
  .setDescription(args)).then(async sentEmbed => {
    await sentEmbed.react('✅')
    sentEmbed.react('❎')
  })
  // Send the embed to the same channel as the message
  message.delete()
}
