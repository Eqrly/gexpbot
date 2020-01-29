module.exports  = (client, guild) => {
  console.log('------------------------------------------');
  console.log("Event [guildCreate] triggered!");
  console.log('------------------------------------------');
  client.settings.ensure(guild.id, client.defaultSettings);
  client.queue.ensure(guild.id, queueContruct);
}
