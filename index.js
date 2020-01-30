process.title = "GexpBot"

const Discord = require("discord.js");
const Enmap = require("enmap");
const fs = require("fs");
const mysql = require("mysql");
const Hypixel = require("hypixel");

const client = new Discord.Client();
const config = require("./config.json");
// We also need to make sure we're attaching the config to the CLIENT so it's accessible everywhere!
client.config = config;
dbconfig = require(`./dbconfig.json`);
client.dbconnection = mysql.createPool({
  host     : dbconfig.host,
  user     : dbconfig.user,
  password : dbconfig.password,
  database : dbconfig.database
});
fs.readdir("./events/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    const event = require(`./events/${file}`);
    let eventName = file.split(".")[0];
    client.on(eventName, event.bind(null, client));
  });
});

client.commands = new Enmap();

fs.readdir("./commands/", (err, files) => {
  if (err) return console.error(err);
  files.forEach(file => {
    if (!file.endsWith(".js")) return;
    let props = require(`./commands/${file}`);
    let commandName = file.split(".")[0];
    console.log(`Attempting to load command ${commandName}`);
    client.commands.set(commandName, props);
  });
});

client.settings = new Enmap();

const defaultSettings = {
  prefix: "&",
  tiers: {
    tier1: "667069061556994069",
    tier2: "667069283238543429",
    tier3: "667069361781080085"
  },
  memberRole: "667068763606220810",
  unverifiedRole: "667069692514664481",
  gexpChannel: "667075955738673222"
}
client.defaultSettings = defaultSettings;

client.queue = new Enmap();
// Creating the contract for our queue
queueConstruct = {
  voiceChannel: null,
  connection: null,
  songs: [],
  volume: 5,
  playing: true,
  loop: 0
};

client.queueConstruct = queueConstruct;

client.Hypixel_client = new Hypixel({ key: config.apiKeys.hypixel });

// update tier every hour
function removeFromArray (array, item) {
  let index = array.indexOf(item);
  if (index !== -1) array.splice(index, 1);
}

var schedule = require('node-schedule');
schedule.scheduleJob('0 */1 * * *', function() {
  client.fetchUser(client.config.ownerID)
  .then(owner => {
    console.log("-----------------------");
    console.log("Schedule \"UpdateTier\" (1 hour)");
    const mysql = require("mysql");

    const Hypixel_client = client.Hypixel_client;

    Hypixel_client.getGuild("5a16eb970cf2c642769b0b68", async (error, guild) => {
      if (error) {
        console.error(error);
        return;
      }
      client.dbconnection.query(`SELECT * FROM bluetoes_dev.members`, async function (error, results, fields) {
        if(error) {
          console.error(error);
          return;
        }
        uuid_discord = new Enmap();
        await results.forEach(row => {
          uuid_discord.set(row.uuid, row.discord_id);
        });

        let updatedMembersText = "";

        var setRolesPromise = new Promise(async (resolve, reject) => {
          for (var member of guild.members) {

            if(!uuid_discord.keyArray().includes(member.uuid)) return;
            let weekly = 0;
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

            let tier = "";
                 if (weekly >= 200000) tier = "tier1";
            else if (weekly >= 100000)  tier = "tier2";
            else                       tier = "tier3";

            let newTier = eval("tiers."+tier);
            memberRoles.push(newTier);

            if (oldTier === newTier) return;

            console.log(`${discord_member.nickname} | ${discord_guild.roles.get(oldTier)?discord_guild.roles.get(oldTier).name:"Not set"} => ${discord_guild.roles.get(newTier).name}`);

            await discord_member.setRoles(memberRoles)
              .catch(console.error);
          }
          resolve();
        });
        setRolesPromise.then(() => {
          client.dbconnection.end();
          console.log("Tiers are all set!");
        });
      });
    });
  })
  .catch(console.error);
});

var gexp_record = [];

function numberWithCommas(x) {
    let parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

function gexp_to_level(gexp) {
  return (((gexp-20000000)/3000000+15-1).toFixed(2));
}

// check gexp rank every hour
schedule.scheduleJob('0 */1 * * *', function () {

  console.log("-----------------------");
  console.log("Schedule \"Leaderboard\" (1 hour)");

  const https = require('https');
  const http_parse = require('node-html-parser');

  https.get('https://plancke.io/hypixel/leaderboards/raw.php?type=guild.experience', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', async function() {
      let leaderboard_table = http_parse.parse(JSON.parse(data).result).querySelector("tbody").childNodes;
      var text =  "Auto-post (every hour)\n"+
                  "```js\n"+
                  "Rank        Guild         Levels  Members    Experience\n"+
                  "----------------------------------------------------------\n";
      var lines = [];
      let line = "";
      let pos_rec;
      for (trow of leaderboard_table) {
        let row = {};
        row.rank = trow.childNodes[0].childNodes[0].rawText;
        row.guild = trow.childNodes[1].childNodes[0].rawAttrs.slice(26).slice(0,-1);
        row.experience = trow.childNodes[2].childNodes[0].rawText;
        row.members = trow.childNodes[3].childNodes[0].rawText;
        if (row.rank > 15) break;
        let diff = 0;
        diff = parseInt(row.experience.replace(/,/g, '')) - gexp_record[row.rank-1];
        if(!gexp_record[row.rank-1]) diff = 0;
        gexp_record[row.rank-1] = parseInt(row.experience.replace(/,/g, ''));

        var level = gexp_to_level(gexp_record[row.rank-1]);

        line = "";
        line+= `[${row.rank.padStart(2, ' ')}] ${row.guild.padEnd(20, ' ')} ${level.toString().padEnd(6, ' ')} (${row.members.padStart(3, ' ')}/125) » ${row.experience.padStart(10, ' ')}`;
        line += " (";
        if(diff > 0) line += "+";
        line += numberWithCommas(diff);
        line += ")\n";

        lines[row.rank-1] = line;

        var guild = await client.Hypixel_client.getGuild(client.config.hypixelGuildID);

        if (row.guild === guild.name)
          pos_rec = row.rank - 1;
      }

      for (var i = pos_rec-2; i <= pos_rec+2; i++) {
        if(i < 0) continue;
        text += lines[i];
      }

      text += "```";
      let channel = await client.channels.get(client.settings.get(client.config.guildID).gexpChannel);
      if(channel) channel.send(text)
        .then(message => {
          message.delete(3600000)
            .catch(console.error);
        })
        .catch(console.error);
    });

  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
});

/*schedule.scheduleJob('* 3 * * 0', function () {
  client.fetchUser(client.config.ownerID)
  .then(owner => {
    let kickedMembersText = "";
    console.log("-----------------------");
    console.log("Schedule \"KickWave\" (Every Saturday 9 p.m. GMT)");

    let discord_guild = client.guilds.get(client.config.guildID);

    const Hypixel_client = client.Hypixel_client;

    Hypixel_client.getGuild("5a16eb970cf2c642769b0b68",async (error, guild) => {
      client.dbconnection.query(`SELECT * FROM bluetoes_dev.members`, function (error, results, fields) {
        if(error) throw error;
        uuid_discord = new Enmap();
        results.forEach(row => {
          uuid_discord.set(row.uuid, row.discord_id);
        });

        guild.members.forEach(async function(member) {

            if(!uuid_discord.keyArray().includes(member.uuid)) return;
            let joined = member.joined;

            var joinedElapse = Date.now() - joined;
            if(joinedElapse < 604800000) return;

            let discord_guild = client.guilds.get('588769495644897298');

            let discord_member = discord_guild.members.get(uuid_discord.get(member.uuid));

            let roles = Array.from(discord_member.roles);
            let roleID = discord_member.roles.keyArray();

            console.log("Scanning for member "+discord_member.nickname);
            console.log(roleID);

            if (roleID.includes(client.settings.get(client.config.guildID).tiers.tier4) && !roleID.includes('588770913420443683')) {
              discord_member.removeRoles(['337266897458429956','625592330648289301','626350262969434113'], 'Kick wave')
                .catch(console.error);
              discord_member.addRole('621380146976522290', 'Kick wave')
                .catch(console.error);
              console.log(`Member "${discord_member.nickname}#${discord_member.user.discriminator} <${discord_member.id}>" has been kicked!`);
              kickedMembersText += `<@${discord_member.id}>\n`;
            }
        });
      });
    });
    if(kickedMembersText === "") kickedMembersText = "**None**";
    embed = new Discord.RichEmbed()
      .setAuthor("Schedule | KickWave (* 3 * * 0) Sunday 3:00 A.M. GMT+8")
      .setColor("GREEN")
      .addField("Kicked Members", kickedMembersText)
      .setFooter("Made by "+owner.username, owner.avatarURL);
    client.logChannel.send(embed)
      .catch(console.error);
  })
  .catch(console.error);
});*/

// update gexp record
function updateGexpRecord(i) {
  const moment = require("moment");
  client.dbconnection.query("SELECT * FROM information_schema.columns WHERE table_name = 'gexp_record'", function(error, result, fields) {
    var columns = [];
    for (var row of result) columns.push(row.COLUMN_NAME);
    var date = moment().subtract(i, 'day').format("YYYY-MM-DD");
    if (!columns.includes(date)) {
      client.dbconnection.query(`ALTER TABLE \`gexp_record\` ADD \`${date}\` INT NULL`, function (error, result, fields) {
        if (error) console.log(error);
      });
    }
    client.Hypixel_client.getGuild("5a16eb970cf2c642769b0b68", function (error, guild) {
      for (var gMember of guild.members) {
        for (var member of guild.members) {
          function exec(member) {
          client.dbconnection.query(`SELECT * FROM gexp_record WHERE uuid = "${member.uuid}"`, function (error, result, fields) {
            if (error || result === []) {
              client.dbconnection.query(`INSERT INTO gexp_record (uuid) VALUES ('${member.uuid}')`, function (error, result, fields) {
                if (error) console.error(error);
              });
            }
            client.dbconnection.query(`UPDATE gexp_record SET \`${date}\` = ${member.expHistory[date]} WHERE \`uuid\` = "${member.uuid}"`, function (error, result, fields) {
              if (error) console.error(error);
            });
          });
        }
          exec(member);
        }
      }
    });
  });
}

schedule.scheduleJob('0 22 * * *', function () {

  console.log("-----------------------");
  console.log("Schedule \"gexp record\" (Every day at 22:00)");

  for (var i = 1; i <= 6; i++) updateGexpRecord(i);
});

client.login(config.token);
