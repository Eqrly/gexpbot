module.exports = (client, oldMember, newMember) => {
  console.log('------------------------------------------');
  console.log("Event [guildMemberUpdate] triggered!");
  const MinecraftApi = require('minecraft-api');

  if(!oldMember.roles.get(client.settings.get(oldMember.guild.id).memberRole) &&
      newMember.roles.get(client.settings.get(oldMember.guild.id).memberRole)) {
        console.log("Member role update detected!");
        const ign = newMember.nickname?newMember.nickname:newMember.user.username;
        MinecraftApi.uuidForName(ign)
         .then(uuid => {
           console.log(`New member name: ${ign} uuid: ${uuid}`);
           client.dbconnection.query(`SELECT * FROM bluetoes_dev.members WHERE uuid = "${uuid}"`, function (error, result, fields) {
             if (!result || !result.length)
               client.dbconnection.query(`INSERT INTO bluetoes_dev.members (
                                   discord_id , uuid
                                 ) VALUES (
                                   '${newMember.id}', '${uuid}'
                                 )`, function (error, results, fields) {});
           });
         })
         .catch(console.error);
      } else if(oldMember.roles.get(client.settings.get(oldMember.guild.id).memberRole) &&
                !newMember.roles.get(client.settings.get(oldMember.guild.id).memberRole)) {
        client.dbconnection.query(`DELETE FROM bluetoes_dev.members WHERE discord_id = "${newMember.id}"`, function (error, results, fields) {
          console.log(`${oldMember.nickname?oldMember.nickname:oldMember.user.username} has been removed from database!`);
        });
      }
}
