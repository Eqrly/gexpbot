module.exports = (client) => {
  const fs = require("fs");
  client.logChannel = client.channels.get('641127903677120512');
  client.guilds.forEach(guild => {
    client.settings.ensure(guild.id, client.defaultSettings);
    client.queue.set(guild.id, client.queueConstruct);
    guild.member(client.user).setNickname(`[${client.settings.get(guild.id).prefix}] GexpBot`)
      .catch(console.error);
  });
  console.log(`Ready to serve in ${client.channels.size} channels on ${client.guilds.size} servers, for a total of ${client.users.size} users.`);
}
