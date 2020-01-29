module.exports = (client, message) => {
  // Ignore all bots
  if (message.author.bot && message.author.id != client.user.id) return;

  // Ignore private messages
  if (!message.guild && message.author.id != client.user.id) {
    message.channel.send("Sorry but I only work in servers!")
      .catch(console.error);
    return;
  }

  // Ignore messages not starting with the prefix (in config.json)
  if (!message.content.startsWith(client.settings.get(message.guild.id).prefix)) return;

  if (message.channel.id === "589947513658802186") {
    message.reply('Please do not send commands here, use ' + '<#589086289123344411>' + ' instead!!!').catch(console.error);
    message.delete().catch(console.error);
    return
  }

  // Our standard argument/command name definition.
  const args = message.content.slice(client.config.prefix.length).trim().split(/ +/g);
  const command = args.shift().toLowerCase();

  // Grab the command data from the client.commands Enmap
  const cmd = client.commands.get(command);

  // If that command doesn't exist, silently exit and do nothing
  if (!cmd) {
    message.channel.send(`Command \`${command}\` doesn't exist!`);
    return;
  }

  // Check if the user has the required permissions
  var pass = true;
  member = message.member;
  for (const perm of eval(`client.config.commands.${command}`).permissions)  {
    if (perm === "OWNER") {
      if (message.author.id != client.config.ownerID) {
        message.channel.send("You're not my master why are you ordering me?");
        pass = false;
      }
    } else if(perm === "GUILD_OWNER") {
      if (message.author.id != client.config.guildOwnerID) {
        message.channel.send(`Only ${client.users.get(client.config.guildOwnerID).username} can use this command!`);
        pass = false;
      }
    } else if(message.author.id != client.config.ownerID) {
      if(!member.hasPermission(perm)) {
        message.reply(`You need \`${perm}\` in order to perform this command!`);
        pass = false;
      }
    }
  }
  if (!pass) return;

  for (var i in args) {
    args[i] = args[i].replace(/[\\<>@#&!]/g, "");
  }

  // Run the command
  console.log('------------------------------------------');
  console.log(`"${message.author.username}#${message.author.discriminator} <${message.author.id}>" invoked command "${command}"`);
  console.log(`Arguments: [${args}]`);
  cmd.run(client, message, args);
};
