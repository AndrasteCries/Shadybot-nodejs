import { chatAction } from '@grammyjs/auto-chat-action'
import { InlineKeyboard, Keyboard } from 'grammy';
import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { isAdmin } from '#root/bot/filters/index.js'
import { setCommandsHandler } from '#root/bot/handlers/index.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { getOldestMessages, deleteMessageById } from '#root/bot/db/db_commands.js';
import { ShareMessage } from '#root/bot/db/db_commands.js';

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
  await sendMessagesWithKeyboard(ctx, 0);
});

// Handle delete button callback
composer.callbackQuery(/^delete:(.+)$/, async (ctx) => {
  try {
    const fileId = ctx.match[1];
    await deleteMessageById(fileId);
    await ctx.deleteMessage();
  } catch (error) {
    console.error('Error handling delete callback:', error);
  }
});

composer.callbackQuery(/^next:(\d+)$/, async (ctx) => {
  try {
    const offset = ctx.match[1];
    await sendMessagesWithKeyboard(ctx, parseInt(offset));
  } catch (error) {
    console.error('Error handling refresh callback:', error);
  }
});


async function sendMessagesWithKeyboard(ctx: Context, offset: number) {
  try {
    const messages = await getOldestMessages(10, offset) as ShareMessage[];

    for (let i = 0; i < messages.length; i++) {
      const message = messages[i];
      const keyboard = new InlineKeyboard().text('Delete', `delete:${message.id}`);

      if (i === messages.length - 1) {
        keyboard.text('Next 10', `next:${offset + 10}`);
      }

      const chat = await ctx.api.getChat(message.user_id);
      const chatId = chat.id.toString();

      await ctx.api.sendPhoto(chatId, message.file_id, {
        caption: `From: ${message.first_name} ${message.last_name} (@${message.username})\nCaption: ${message.caption}`,
        reply_markup: keyboard
      });
    }

    if (messages.length === 0) {
      await ctx.reply('No more messages to display.');
    }
  } catch (error) {
    console.error('Error sending photo or editing message:', error);
  }
}
export { composer as adminFeature }
