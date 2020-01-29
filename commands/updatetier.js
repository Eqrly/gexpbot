function removeFromArray (array, item) {
  var index = array.indexOf(item);
  if (index !== -1) array.splice(index, 1);
}

exports.run = (client, message, args) => {
  message.channel.send("Updating tiers...");
  client.fetchUser(client.config.ownerID)
  .then(async function(owner) {
    const Hypixel = require('hypixel');
    const Discord = require('discord.js');
    const Enmap = require('enmap');

    const Hypixel_client = client.Hypixel_client;

    await Hypixel_client.getGuild("5a16eb970cf2c642769b0b68", async function(error, guild) {
      client.dbconnection.query(`SELECT * FROM bluetoes_dev.members`, async function (error, results, fields) {
        if(error) {
          console.error(error);
          return;
        }
        uuid_discord = new Enmap();
        await results.forEach(row => {
          uuid_discord.set(row.uuid, row.discord_id);
        });

        var setRolesPromise = new Promise((resolve, reject) => {
          guild.members.forEach(async (member) => {

            if(!uuid_discord.keyArray().includes(member.uuid)) return;
            var weekly = 0;
            for (var key in member.expHistory) {
              weekly += member.expHistory[key];
            }

            let discord_guild = client.guilds.get(client.config.guildID);

            var discord_member = discord_guild.member(uuid_discord.get(member.uuid));
            if (!discord_member) return;
            var oldTier;

            const tiers = client.settings.get(client.config.guildID).tiers;
            if      (discord_member.roles.get(tiers.tier1)) oldTier = tiers.tier1;
            else if (discord_member.roles.get(tiers.tier2)) oldTier = tiers.tier2;
            else if (discord_member.roles.get(tiers.tier3)) oldTier = tiers.tier3;

            var memberRoles = discord_member.roles.keyArray();
            removeFromArray(memberRoles, tiers.tier1);
            removeFromArray(memberRoles, tiers.tier2);
            removeFromArray(memberRoles, tiers.tier3);

            var tier = "";
                 if (weekly >= 200000) tier = "tier1";
            else if (weekly >= 100000) tier = "tier2";
            else                       tier = "tier3";

            var newTier = eval("tiers."+tier);
            memberRoles.push(newTier);

            if (oldTier === newTier) return;

            console.log(`${discord_member.nickname} | ${discord_guild.roles.get(oldTier)?discord_guild.roles.get(oldTier).name:"Not set"} => ${discord_guild.roles.get(newTier).name}`);

            await discord_member.setRoles(memberRoles)
              .catch(console.error);
            });
          });
        setRolesPromise.then(() => {
          console.log("Tiers are all set!");
          message.reply("Tiers are all set!")
            .catch(console.error);
        });
      });
    });
  })
  .catch(console.error);
}
