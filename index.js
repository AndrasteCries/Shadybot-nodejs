const TelegramBot = require("node-telegram-bot-api");
const keep_alive = require("./keep_alive.js");
const token = process.env.BOT_TOKEN;
const publicChannelId = process.env.CHANNEL_ID;
const ownerId = process.env.OWNER_ID;

const bot = new TelegramBot(token, { polling: true });

function checkSubscriberStatus(msg, callback) {
  bot
    .getChatMember(publicChannelId, msg.from.id)
    .then((data) => {
      if (
        data.status === "member" ||
        data.status === "administrator" ||
        data.status === "creator"
      ) {
        callback(true);
      } else {
        callback(false);
      }
    })
    .catch((error) => {
      console.error(error);
      bot.sendMessage(msg.chat.id, "Something went wrong.");
    });
}

bot.onText(/\/start/, (msg) => {
  const chatId = msg.chat.id;

  checkSubscriberStatus(msg, (isSubscriber) => {
    if (isSubscriber) {
      bot.sendMessage(chatId, "Hello dear subscriber.");
    } else {
      bot.sendMessage(
        chatId,
        "Oh, hello random person, subscribe to my channel: https://t.me/picshady."
      );
    }
  });

  // Отправляем приветственные сообщения
  bot.sendMessage(chatId, "Welcome to the bot!");
  bot.sendMessage(
    chatId,
    "Now you can send pictures here that may appear in our channel. ALL ANONYMOUS!"
  );
});

bot.on("message", (msg) => {
  const chatId = msg.chat.id;

  checkSubscriberStatus(msg, (isSubscriber) => {
    if (isSubscriber) {
      bot.forwardMessage(ownerId, chatId, msg.message_id);
      bot.sendMessage(chatId, `Thank you!`);
    } else {
      bot.sendMessage(
        chatId,
        "Please subscribe to our channel to submit pictures."
      );
    }
  });
});

bot.on("polling_error", (error) => {
  console.error("Polling error:", error);
});

console.log("Bot is up and running");
