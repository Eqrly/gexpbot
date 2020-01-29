function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}
exports.run = (client, message, args) => {
  if (!args.length) {
    message.reply("Too few arguments!")
      .catch(console.error);
    message.channel.send("&help gexp")
      .then(msg => {
        msg.delete().catch(console.error);
      })
      .catch(console.error);
    return;
  }
  client.fetchUser(client.config.ownerID)
  .then(async function(owner) {
    const Hypixel = require('hypixel');
    const Discord = require('discord.js');
    const MinecraftApi = require('minecraft-api');

    const Hypixel_client = client.Hypixel_client;

    await Hypixel_client.getGuild("5a16eb970cf2c642769b0b68", function(error, guild) {
      MinecraftApi.uuidForName(args[0])
      .then((uuid) => {
        var text =  "```\n";
        var total = 0;
        var rank = "";
        var joined;
        var inGuild = false;
        for (member of guild.members) {
          if (member.uuid != uuid) continue;
          inGuild = true;
          for (expHistoryDate in member.expHistory) {
            text += `${expHistoryDate} => ${numberWithCommas(member.expHistory[expHistoryDate])}\n`;
            total += member.expHistory[expHistoryDate];
          }
          rank = member.rank;
          joined = member.joined;
        }

        if (!inGuild) {
          message.reply(`the user ${args[0]} isn't in v2`).catch(console.error);
          return;
        }

        var months = ['Jan.','Feb.','Mar.','Apr.','May.','Jun.','Jul.','Aug.','Sep.','Oct.','Nov.','Dec.'];
        var date = new Date(joined);
        var dateString = `${date.getUTCHours()}:${date.getUTCMinutes()}:${date.getUTCSeconds()} ${months[date.getUTCMonth()]} ${date.getUTCDate()} ${date.getUTCFullYear()} G.M.T.`;
        text += "----------------------\n";
        text += `Total:   ${numberWithCommas(total)}\n`;
        text += `Average: ${numberWithCommas(parseInt(total/7))}\n`;
        text += `----------------------\n`;
        text += `Joined: ${dateString}\n`;
        text += `Rank: ${rank}\n`;
        text += "```";
        var ign = args[0];
        embed = new Discord.RichEmbed()
        .setDescription(text)
        .setColor("RANDOM")
        .setAuthor(message.author.username+"#"+message.author.discriminator, message.author.avatarURL)
        .setTitle(`${ign}'s Player info`)
        .setTimestamp()
        .setFooter("Made by "+owner.username+"#"+owner.discriminator, owner.avatarURL);
        message.channel.send(embed).catch(console.error);
      })
      .catch((error) => {
        console.error(error);
        message.reply(`Can't find a user with the name of ${args[0]}`).catch(console.error);
      });
    });
  })
  .catch(console.error);
}
