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
    message.channel.send("&help whitelist")
      .then((msg) => {
        msg.delete().catch(console.error);
      })
      .catch(console.error);
    return;
  }
  if (!["add","remove"].includes(args[0])) {
    message.reply("Invalid operation.")
      .catch(console.error);
    message.delete(3025)
      .catch(console.error);
    message.channel.send("&help whitelist")
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
        client.dbconnection.query(`INSERT INTO whitelist (uuid) VALUES("${uuid}")`, function(error, result, fields) {
          if (error) console.error(error);
          message.reply(`${(error)?"An unexpected error happened!":`Member ${args[1]} added to whitelist.`}`)
            .catch(console.error);
          message.delete(3025)
            .catch(console.error);
        });
      } else if (args[0] === "remove") {
        client.dbconnection.query(`DELETE FROM whitelist WHERE uuid = "${uuid}"`, function(error, result, fields) {
          message.reply(`${(error)?"Can't find the specified member in the whitelist.":`Member ${args[1]} removed from whitelist.`}`)
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
