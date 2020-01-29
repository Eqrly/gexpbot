exports.run = (client, message, args) => {
  var Discord = require("discord.js");
  if (args.length < 3) {
    message.reply("Too few arguments.")
      .then(msg => {
        msg.delete(3000)
          .catch(console.error);
      })
      .catch(console.error);
    message.delete(3025)
      .catch(console.error);
    message.channel.send("&help verify")
      .then((msg) => {
        msg.delete().catch(console.error);
      })
      .catch(console.error);
    return;
  }
  args[2] = args[2].toLowerCase();
  if (!["member", "guest", "guests"].includes(args[2])) {
    message.reply("Sorry but the verification category doesn't exist.")
      .then(msg => {
        msg.delete(3000)
          .catch(console.error);
      })
      .catch(console.error);
    message.delete(3025)
      .catch(console.error);
    return;
  }

  const MinecraftApi = require('minecraft-api');
  MinecraftApi.uuidForName(args[1])
    .then(() => {
      console.log(args[0]);
      message.guild.fetchMember(args[0])
        .then(async (member) => {
          await member.setNickname(args[1], "Verification")
            .catch(console.error);
          await member.removeRole("667069692514664481", "Verification")
            .catch(console.error);

          if (args[2] === "member" || args[2] === "members") {
            await member.addRole("667068763606220810", "Verification - Members")
              .catch(console.error);
          } else if (args[1] === "guest" || args[1] === "guests") {
            await member.addRole("667101698367422502", "Verification - Guests")
              .catch(console.error);
          }

          const verifyLog = new Discord.RichEmbed()
          .setAuthor(message.author.tag, message.author.avatarURL)
          .setTitle('User verified')
          .addField('User', `<@${args[0]}>`)
          .addField('Officer', `<@${message.author.id}>`)
          .setFooter(client.users.get('337266897458429956').tag + 'made this log message', client.users.get('337266897458429956').avatarURL)
          .setTimestamp();

          client.channels.get(client.config.logChannelID).send(verifyLog)

          message.reply("The member has been verified!")
            .then(msg => {
              msg.delete(3000)
                .catch(console.error);
            })
            .catch(console.error);
          message.delete(3025)
            .catch(console.error);
        })
        .catch(err => {
          console.error(err);
          message.reply("An unexpected error happened!")
            .then(msg => {
              msg.delete(3000)
                .catch(console.error);
            })
            .catch(console.error);
          message.delete(3025)
            .catch(console.error);
        });
    })
    .catch(err => {
      message.reply("Can't find the corresponding uuid for the input username")
        .then(msg => {
          msg.delete(3000)
            .catch(console.error);
        })
        .catch(console.error);
      message.delete(3025)
        .catch(console.error);
      console.error(err);
      return;
    })
}
