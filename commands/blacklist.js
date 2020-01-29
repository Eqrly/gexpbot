exports.run = (client, message, args) => {
  if (args.length < 2) {
    message.reply("Too few arguments.")
      .then(msg => {
        msg.delete(3000)
          .catch(console.error);
      })
      .catch(console.error);
    message.delete(3025)
      .catch(console.error);
    message.channel.send("&help blacklist")
      .then((msg) => {
        msg.delete().catch(console.error);
      })
      .catch(console.error);
    return;
  }
  if (args.length > 1) {
    for (var i in args) {
      if (i > 2) args[2] += " "+args[i];
    }
  }
  if (!["add","remove"].includes(args[0])) {
    message.reply("Invalid operation.")
      .catch(console.error);
    message.delete(3025)
      .catch(console.error);
    message.channel.send("&help blacklist")
      .then((msg) => {
        msg.delete().catch(console.error);
      })
      .catch(console.error);
    return;
  }

  const MinecraftApi = require('minecraft-api');
  MinecraftApi.uuidForName(args[1])
    .then((uuid) => {

      if (args[0] === "add") {
        client.dbconnection.query(`SELECT * FROM blacklist WHERE uuid = ${uuid}`, function(error, result, fields) {
          if (!result)
            client.dbconnection.query(`INSERT INTO blacklist (uuid, reason) VALUES("${uuid}", "${args[2]?args[2]:""}")`, function(error, result, fields) {
              if (error) console.error(error);
              message.reply(`${(error)?"An unexpected error happened!":`Member ${args[1]} added to blacklist with reason \"${args[2]}\".`}`)
                .catch(console.error);
              message.delete(3025)
                .catch(console.error);
            });
          else {
            message.reply(`Member is already blacklisted with reason \"${result[0].reason}\"`)
              .catch(console.error);
            message.delete(3025)
              .catch(console.error);
          }
        });
      } else if (args[0] === "remove") {
        client.dbconnection.query(`DELETE FROM blacklist WHERE uuid = "${uuid}"`, function(error, result, fields) {
          message.reply(`${(error)?"Can't find the specified member in the blacklist.":`Member ${args[1]} removed from blacklist.`}`)
            .catch(console.error);
          message.delete(3025)
            .catch(console.error);
        });
      }
    })
    .catch(err => {
      message.reply("Can't find the corresponding uuid for the input username")
        .catch(console.error);
      message.delete(3025)
        .catch(console.error);
      console.error(err);
      return;
    })
}
