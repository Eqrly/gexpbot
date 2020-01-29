function numberWithCommas(x) {
    var parts = x.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
}

async function nameForUuid(uuid) {
  const MinecraftApi = require('minecraft-api');
  var name = "";
  await MinecraftApi.nameHistoryForUuid(uuid)
  .then((nameHistory) => {
    name = nameHistory[nameHistory.length-1].name;
  });
  return name;
}

exports.run = async (client, message, args) => {
  var oldMessage = await message.channel.send("Fetching data...").catch(console.error);
  var gexpRecord = [];
  client.dbconnection.query("SELECT * FROM gexp_record", async function (error, result, fields) {
    if (!result) return oldMessage.edit("Unable to fetch data from database!")
    .catch(console.error);
    for (var row of result) {
      row = Object.values(row);
      var member = {uuid:"", gexp:0};
      member.uuid = row[0];
      for (var i in row) {
        if (i == 0 || !row[i]) continue;
        member.gexp += row[i];
      }
      gexpRecord.push(member);
    }
    gexpRecord.sort(function(a,b){
    var comp = 0;
    if(a.gexp>b.gexp) comp=-1;
    else if(a.gexp<b.gexp) comp=1;
    return comp;
    });
    var text =  "```yaml\n"+
                "Xmas G-Exp Competition - Top 10 Grinders\n"+
                "----------------------------------------\n";
    for (var i = 0; i < 10; i++) {
      var name = await nameForUuid(gexpRecord[i].uuid);
      text += `${(i+1).toString().padStart(2, " ")}. ${name.padEnd(16, " ")} -> ${numberWithCommas(gexpRecord[i].gexp)}\n`;
    }
    text += "```";
    oldMessage.edit(text).catch(console.error);
  });
}
