let http = require("http");

http
  .createServer(function (req, res) {
    res.write("I'm alive!");
    res.write(`token = ${process.env.BOT_TOKEN}`);
    res.write(`publicChannelId = ${process.env.CHANNEL_ID}`);
    res.write(`ownerId = ${process.env.OWNER_ID}`);
    res.end();
  })
  .listen(8080);
