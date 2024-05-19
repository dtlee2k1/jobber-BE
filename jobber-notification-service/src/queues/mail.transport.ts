import { IEmailLocals, winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@notifications/config';
import { emailTemplates } from '@notifications/helpers';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'mailTransport', 'debug');

export async function sendEmail(template: string, receiverEmail: string, locals: IEmailLocals) {
  try {
    await emailTemplates(template, receiverEmail, locals);
    logger.info('Email sent successfully');
  } catch (error) {
    logger.log({ level: 'error', message: `NotificationService MailTransport sendEmail() method error: ${error}` });
  }
}
