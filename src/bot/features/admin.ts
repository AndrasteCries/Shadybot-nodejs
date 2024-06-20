import { chatAction } from '@grammyjs/auto-chat-action'
import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { isAdmin } from '#root/bot/filters/index.js'
import { setCommandsHandler } from '#root/bot/handlers/index.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { config } from '#root/config.js'

const composer = new Composer<Context>()

const feature = composer.chatType('private').filter(isAdmin)

feature.command(
  'setcommands',
  logHandle('command-setcommands'),
  chatAction('typing'),
  setCommandsHandler,
)

feature.command('hello', logHandle('admin-start'), async (ctx) => {
  const adminIds = config.BOT_ADMINS.join(', ');

  try {
    const userProfilePhotos = await ctx.getUserProfilePhotos();
    
    if (userProfilePhotos.total_count > 0) {
      const photo = userProfilePhotos.photos[0][0];
      await ctx.replyWithPhoto(photo.file_id, {
        caption: `Admin IDs: ${adminIds}`
      });
    } else {
      await ctx.reply(`Admin IDs: ${adminIds}`);
    }
  } catch (error) {
    console.error('Error fetching user profile photos:', error);
    await ctx.reply(`Error fetching user profile photos`);
  }
});

export { composer as adminFeature }
