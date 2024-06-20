import { chatAction } from '@grammyjs/auto-chat-action'
import { InlineKeyboard } from 'grammy';
import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { isAdmin } from '#root/bot/filters/index.js'
import { setCommandsHandler } from '#root/bot/handlers/index.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { getOldestMessages, deleteMessageById } from '#root/bot/db/db_commands.js';
import { ShareMessage } from '#root/bot/db/db_commands.js';
import { log } from 'console';

const composer = new Composer<Context>()

const feature = composer.chatType('private').filter(isAdmin)

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
)

// Command to view messages
composer.command('viewmessages', async (ctx) => {
  try {
    const messages = getOldestMessages(10, 0) as ShareMessage[];
    
    for (const message of messages) {
      const hello_death = "qweqweqw"
      const fileId = "AgACAgIAAxkBAAOTZnSnCDEnRKdWlq7Cv25c0b-I-VkAAoHYMRuiealLt"
      const keyboard = new InlineKeyboard().text('Delete', `delete:${fileId}`);
      const chat = await ctx.api.getChat(message.user_id);
      const chatId = chat.id.toString();
      
      await ctx.api.sendPhoto(chatId, message.file_id, {
        caption: `From: ${message.first_name} ${message.last_name} (@${message.username})\nCaption: ${message.caption}`,
        reply_markup: keyboard
      });
    }
  } catch (error) {
    console.error('Error sending photo or editing message:', error);
  }
});

// Handle delete button callback
composer.callbackQuery(/^delete:(.+)$/, async (ctx) => {
  try {
    const fileId = ctx.match[1];
    await deleteMessageById(ctx.callbackQuery.data); // Assuming deleteMessageById deletes the message
    await ctx.deleteMessage(); // Delete the original callback query message
  } catch (error) {
    console.error('Error handling delete callback:', error);
  }
});
// Handle next button callback
// feature.callbackQuery(/^next:(\d+)$/, async (ctx) => {
//   const offset = parseInt(ctx.match[1], 10);
//   const messages = getOldestMessages(10, offset) as ShareMessage[];
//   const keyboard = await createMessageManagementKeyboard(ctx, offset);


//   for (const message of messages) {
//     console.log(message)
//     await ctx.replyWithPhoto(message.file_id, {
//       caption: `From: ${message.first_name} ${message.last_name} (@${message.username})\nCaption: ${message.caption}`,
//       reply_markup: keyboard.text('Delete', `delete:${message.file_id}`).row()
//     });
//   }
// });

export { composer as adminFeature }
