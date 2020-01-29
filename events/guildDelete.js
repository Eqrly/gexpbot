module.exports = (client, guild) => {
  console.log('------------------------------------------');
  console.log("Event [guildDelete] triggered!");
    console.log('------------------------------------------');
  client.settings.delete(guild.id);
  client.queue.delete(guild.id);
}
