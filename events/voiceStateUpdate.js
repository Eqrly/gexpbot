module.exports = (client, oldMember, newMember) => {
  console.log('------------------------------------------');
  console.log("Event [voiceStateUpdate] triggered!");
    console.log('------------------------------------------');
  let newUserChannel = newMember.voiceChannel;
  let oldUserChannel = oldMember.voiceChannel;

  var logChannel = client.channels.get(client.config.logChannelID);

}
