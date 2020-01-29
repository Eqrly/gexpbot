exports.run = (client, message, args) => {
  const Discord = require("discord.js");

  if (!message.guild) {
    message.channel.send("Um... where's the server settings?...\nIn a server right?");
    return;
  }

  const guildConf = client.settings.get(message.guild.id);

  args.forEach(arg => {
    arg = arg.toLowerCase();
  });

  if (!args.length) {
    client.fetchUser(client.config.ownerID)
    .then(owner => {
      embed = new Discord.RichEmbed()
        .setTitle("Available settings")
        .addField("Prefix", "Currently set to "+`\`${guildConf.prefix}\`\n`+
                            `To config please use \`${guildConf.prefix}settings prefix [prefix]\`\n`)
        .addField("Tiers",  "Currently set to:\n"+
                            `Tier 1: ${guildConf.tiers.tier1 === "" ? "`Undefined`" : `<@&${guildConf.tiers.tier1}>`}\n`+
                            `Tier 2: ${guildConf.tiers.tier2 === "" ? "`Undefined`" : `<@&${guildConf.tiers.tier2}>`}\n`+
                            `Tier 3: ${guildConf.tiers.tier3 === "" ? "`Undefined`" : `<@&${guildConf.tiers.tier3}>`}\n`+
                            `To config please use \`${guildConf.prefix}settings tiers [tier1/tier2/tier3] [role_id]\``)
        .addField("MemberRole", "Currently set to "+`${guildConf.memberRole === "" ? "`Undefined`" : `<@&${guildConf.memberRole}>`}\n`+
                            `To config please use \`${guildConf.prefix}settings memberRole [role_id]\`\n`)
        .addField("GexpChannel", "Currently set to "+`${guildConf.gexpChannel === "" ? "`Undefined`" : `<#${guildConf.gexpChannel}>`}\n`+
                            `To config please use \`${guildConf.prefix}settings gexpChannel [channel_id]\`\n`)
        .setColor("RANDOM")
        .setAuthor(message.author.username+"#"+message.author.discriminator, message.author.avatarURL)
        .setFooter("Made by "+owner.username+"#"+owner.discriminator, owner.avatarURL);
        message.channel.send(embed).catch(console.error);
    });
  } else if(args[0] === "prefix") {
    client.settings.set(message.guild.id, args[1], "prefix");
    message.reply(`My prefix has been set to \`${client.settings.get(message.guild.id).prefix}\`!`)
      .catch(console.error);
    message.guild.member(client.user).setNickname(`[ ${client.settings.get(message.guild.id).prefix} ] GexpBot`)
      .catch(console.error);
  } else if(args[0] === "tiers" || args[0] === "tier") {
    if(!["tier1","tier2","tier3"].includes(args[1])) {
      message.reply("Invalid tier! Argument must be one of [tier1, tier2, tier3]")
        .catch(console.error);
      return;
    }
    client.settings.set(message.guild.id, args[2], `tiers.${args[1]}`);
    message.reply(`${args[1]} has been set to <@&${args[2]}>`)
      .catch(console.error);
  } else if(args[0] === "memberrole") {
    client.settings.set(message.guild.id, args[1], "memberRole");
    message.reply(`${args[0]} has been set to <@&${args[1]}>`)
      .catch(console.error);
  } else if(args[0] === "gexpchannel") {
    client.settings.set(message.guild.id, args[1], "gexpChannel");
    message.reply(`${args[0]} has been set to <#${args[1]}>`)
      .catch(console.error);
  } else {
    message.reply("Please specify a valid option this time please");
  }
}
