const Hypixel = require('hypixel');
const Discord = require('discord.js');
const MinecraftApi = require('minecraft-api');

var embed = new Discord.RichEmbed();
var loop = true;

async function exec(msg) {
  while(loop)
    await msg.edit(embed);
}

function numberWithCommas(x) {
  if (!x || x === undefined) return "0";
  var parts = x.toString().split(".");
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return parts.join(".");
}
async function fetchPage(index, gexpArray) {
  const MinecraftApi = require('minecraft-api');
  var text =  "```\n";
  for (var i = (index-1)*10; i < ((index*10>gexpArray.length)?gexpArray.length:index*10); i++) {
    text += `${(i+1).toString().padStart(3, " ")}. ${gexpArray[i].name.padEnd(16, " ")} » ${numberWithCommas(gexpArray[i].gexp)}\n`;
  }
  text += "```";
  return text;
}
exports.run = (client, message, args) => {
  if (args[0]) args[0] = args[0].toLowerCase();
  var owner = client.users.get(client.config.ownerID);

  client.Hypixel_client.getGuild("5a16eb970cf2c642769b0b68", async (error, guild) => {
    var total = 0;
    var gexpArray = [];
    embed
    .setDescription(`Fetching members data... (0/${guild.members.length}) loaded`)
    .setColor("GREEN")
    .setAuthor(message.author.username+"#"+message.author.discriminator, message.author.avatarURL)
    .setTitle("Loading")
    .setTimestamp()
    .setFooter("Made by "+owner.username+"#"+owner.discriminator, owner.avatarURL);
    var msg = await message.channel.send(embed).catch(console.error);
    exec(msg);
    for (var i = 0; i < guild.members.length; i++) {
      var member = guild.members[i];
      total = 0;
      if (args[0] === "weekly")
        for (expHistoryDate in member.expHistory) {
          total += member.expHistory[expHistoryDate];
        }
      else
        total = member.expHistory[Object.keys(member.expHistory)[0]];
      var name = await MinecraftApi.nameHistoryForUuid(member.uuid).catch(console.error);
      name = name[name.length-1].name;
      var tObj = {name: name, gexp: total};
      gexpArray.push(tObj);
      embed.setDescription(`Fetching members data... (${i+1}/${guild.members.length}) loaded`);
    }
    gexpArray.sort((a,b)=>{return b.gexp-a.gexp});
    stop = false;
    var index = 1;
    var text = await fetchPage(index, gexpArray);
    embed.setDescription(text)
    .setTitle(`#${(index-1)*10+1} ~ #${(index*10>gexpArray.length)?gexpArray.length:index*10}`)
    msg.edit(embed);
    await msg.react("⏪");
    await msg.react("◀️");
    await msg.react("⛔");
    await msg.react("▶️");
    await msg.react("⏩");
    var collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id && ["⏪","◀️","⛔","▶️","⏩"].includes(reaction.emoji.name), {time: 60000})
    .on("collect", async (reaction) => {
      const emoji = reaction.emoji.name;
      for (var user of reaction.users.keyArray()) {
        if (user === client.user.id) continue;
        reaction.remove(user);
      }
      switch (emoji) {
        case "⏩":
        index = Math.ceil(gexpArray.length/10);
        break;
        case "▶️":
        index++;
        break;
        case "◀️":
        index--;
        break;
        case "⏪":
        index = 0;
        break;
        default:
        collector.stop();
      }
      if (index*10-gexpArray.length>10) index--;
      if (index < 1) index++;
      text = await fetchPage(index,gexpArray);
      embed.setDescription(text)
      .setTitle(`#${(index-1)*10+1} ~ #${(index*10>gexpArray.length)?gexpArray.length:index*10}`);
      msg.edit(embed);
    })
    .once("end", reason => {
      msg.clearReactions();
      embed.setColor("GREY");
      msg.edit(embed);
    });
  });
}
