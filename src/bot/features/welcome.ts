import { Composer } from 'grammy'
import type { Context } from '#root/bot/context.js'
import { logHandle } from '#root/bot/helpers/logging.js'
import { config } from '#root/config.js'
import { addUser, addMessage } from '#root/bot/db/db_commands.js';
import { User } from '@grammyjs/types';
import { MyUser } from '#root/bot/db/db_commands.js';

const composer = new Composer<Context>()

const feature = composer.chatType('private')

async function addUserToDb(userData: User): Promise<void> {
  try {
    const user: MyUser = {
      userId: userData.id,
      firstName: userData.first_name,
      lastName: userData.last_name,
      username: userData.username,
    };
    addUser(user);
  } catch (error) {
    console.error('Error adding user to DB:', error); 
  }
}

async function addMessageToDb(userId: number, photoFileId: string, caption: string): Promise<void> {
  try {
    const message = {
      userId: userId,
      fileId: photoFileId,
      caption: caption
    };
    addMessage(message);
  } catch (error) {
    console.error('Error adding user to DB:', error); 
  }
}


feature.command('start', logHandle('command-start'), (ctx) => {
  const userData = ctx.from;
  if (!userData){
    return ctx.reply('Cant find you.');
  }

  addUserToDb(userData);

  return ctx.reply(ctx.t('welcome'))
});

feature.command('givephoto', logHandle('command-start'), async (ctx) => {
  return await ctx.api.sendPhoto(ctx.chat.id, 'AgACAgIAAxkBAAN2ZnRd222GSLRXKt87xkgMVIw_kfAAArXfMRsvJ6FLNAyMJuyhkhwBAAMCAANzAAM1BA');
});


feature.on(':photo', async (ctx) => {
  if (!ctx.message || !ctx.message.photo || ctx.message.photo.length === 0) {
    return ctx.reply('Something going wrong with your message type, sry.');
  }
  const userId = ctx.from?.id;
  const admins = config.BOT_ADMINS;

  if (!admins.includes(ctx.from?.id)) {
    try {
      const photoFileId = ctx.message.photo[0].file_id;
      const caption = ctx.message.caption || '';
      
      addMessageToDb(userId, photoFileId, caption);

      await ctx.reply('Photo has been sent to the admin.');
    } catch (error) {
      console.error('Error sending photo:', error);
      await ctx.reply('An error occurred while sending the photo.');
    }
  } else {
    await ctx.reply('You are an administrator, the photo was not sent.');
  }
});


export { composer as welcomeFeature }
