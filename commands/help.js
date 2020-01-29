exports.run = (client, message, args) => {
    const owner = client.fetchUser(client.config.ownerID);
    const Discord = require('discord.js');

    var description = "";

    client.fetchUser(client.config.ownerID)
    .then(owner => {
      embed = new Discord.RichEmbed().setTitle("Commands");

      if (!args || args.length === 0)
        for (var module_name in client.config.modules) {
          var mod = client.config.modules[module_name];
          var text = "";
          for (var i in mod) {
            text += `\`${mod[i]}\` `;
          }
          embed.addField(module_name, `${text}`, true);
        }
      else {
        if (!Object.keys(client.config.commands).includes(args[0]) && !Object.keys(client.config.modules).includes(args[0])) {
          embed .setTitle("Error")
                .setDescription("Sorry but that command/module doesn't exist.");
        } else if (Object.keys(client.config.modules).includes(args[0])) {
          var mod = client.config.modules[args[0]];
          var text = "";
          for (var i in mod) {
            text += `\`${mod[i]}\` `;
          }
          embed.addField(`${args[0]}`, `${text}`);
        } else {
          var arguments = "";
          for (var arg of client.config.commands[args[0]].arguments) {
            arguments += " "+arg;
          }
          embed.addField(`\`${args[0]}${arguments}\``, client.config.commands[args[0]].description);
          for (var alt of client.config.commands[args[0]].alternatives) {

            var alt_arguments = "";
            for (var i in alt.arguments) {
              alt_arguments += " "+alt.arguments[i];
            }
            embed.addField(`\`${args[0]}${alt_arguments}\``, alt.description);
          }
          var permissions = "";
          for (var perm of client.config.commands[args[0]].permissions) {
             permissions += `\`${perm}\` `;
          }
          embed.addField("Required permissions:", permissions?permissions:"none");
        }
      }
      embed.setColor("RANDOM")
        .setTimestamp()
        .setAuthor(message.author.username+"#"+message.author.discriminator, message.author.avatarURL)
        .setFooter("Made by "+owner.username+"#"+owner.discriminator, owner.avatarURL);
      message.channel.send(embed).catch(console.error);
    });
}
