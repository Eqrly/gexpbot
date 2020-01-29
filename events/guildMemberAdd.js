module.exports = (client, member) => {
  console.log('------------------------------------------');
  console.log("Event [guildMemberAdd] triggered!");
    console.log('------------------------------------------');
  console.log(`New member joined! ${member.username}#${member.discriminator} <${member.id}>`);
  member.addRole(client.settings.get(member.guild.id).unverifiedRole)
    .catch(console.error);
}
