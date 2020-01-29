function removeFromArray (array, item) {
  var index = array.indexOf(item);
  if (index !== -1) array.splice(index, 1);
}

function gexp_to_level(gexp) {
  return (((gexp-20000000)/3000000+15-1).toFixed(2));
}

function fetchPage(index, leaderboard_table) {
  var text =  "```js\n"+
              " Rank        Guild             Levels  Members    Experience\n"+
              "-----------------------------------------------------------\n";
  for(i = (index)*10; i < (index+1)*10; i++) {
    var trow = leaderboard_table[i];
    var row = {};
    row.rank = trow.childNodes[0].childNodes[0].rawText;
    row.guild = trow.childNodes[1].childNodes[0].rawAttrs.slice(26).slice(0,-1);
    row.experience = trow.childNodes[2].childNodes[0].rawText;
    row.members = trow.childNodes[3].childNodes[0].rawText;

    var gexp = parseInt(row.experience.replace(/,/g, ''));
    var level = gexp_to_level(gexp);

    text += `[${row.rank.padStart(4, ' ')}] ${row.guild.padEnd(20, ' ')} ${level.toString().padEnd(6, ' ')} (${row.members.padStart(3, ' ')}/125) » ${row.experience.padStart(10, ' ')}\n`;
  }
  text += "```";
  return text;
}

exports.run = (client, message, args) => {
  var ranklist = [];

  const https = require('https');
  const http_parse = require('node-html-parser');

  https.get('https://plancke.io/hypixel/leaderboards/raw.php?type=guild.experience', (resp) => {
    let data = '';

    // A chunk of data has been recieved.
    resp.on('data', (chunk) => {
      data += chunk;
    });

    // The whole response has been received. Print out the result.
    resp.on('end', async () => {
      var index = 0;
      let leaderboard_table = http_parse.parse(JSON.parse(data).result).querySelector("tbody").childNodes;
      var text = "Page "+(index+1)+"/100\n"+fetchPage(index, leaderboard_table);
      var msg = await message.channel.send(text).catch(console.error);
      await msg.react("⏪");
      await msg.react("◀️");
      await msg.react("⛔");
      await msg.react("▶️");
      await msg.react("⏩");
      var collector = msg.createReactionCollector((reaction, user) => user.id === message.author.id && ["⏪","◀️","⛔","▶️","⏩"].includes(reaction.emoji.name), {time: 60000})
      .on("collect", reaction => {
        const emoji = reaction.emoji.name;
        for (var user of reaction.users.keyArray()) {
          if (user === client.user.id) continue;
          reaction.remove(user);
        }
        switch (emoji) {
          case "⏩":
          index = 100;
          break;
          case "▶️":
          index++;
          break;
          case "◀️":
          index--;
          break;
          case "⏪":
          index = 0;
          break;
          default:
          collector.stop();
        }
        if (index > 99) index--;
        if (index < 0) index++;
        text = "Page "+(index+1)+"/100\n"+fetchPage(index, leaderboard_table);
        msg.edit(text);
      })
      .once("end", reason => {
        msg.delete();
      });
    });


  }).on("error", (err) => {
    console.log("Error: " + err.message);
  });
}
