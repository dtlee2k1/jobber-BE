import { IEmailLocals, winstonLogger } from '@dtlee2k1/jobber-shared';
import envConfig from '@notifications/config';
import nodemailer from 'nodemailer';
import Email from 'email-templates';
import path from 'path';

const logger = winstonLogger(`${envConfig.ELASTIC_SEARCH_URL}`, 'mailTransportHelper', 'debug');

export async function emailTemplates(template: string, receiver: string, locals: IEmailLocals) {
  try {
    const smtpTransport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: envConfig.SENDER_EMAIL,
        pass: envConfig.SENDER_EMAIL_PASSWORD
      }
    });

    const email = new Email({
      message: {
        from: `Jobber App <${envConfig.SENDER_EMAIL}>`
      },
      send: true,
      preview: false,
      transport: smtpTransport,
      views: {
        options: {
          extension: 'ejs'
        }
      },
      juice: true, // use inline css in template
      juiceResources: {
        preserveImportant: true,
        webResources: {
          relativeTo: path.resolve('build')
        }
      }
    });
    await email.send({
      template: path.resolve(`src/emails/${template}`),
      message: {
        to: receiver
      },
      locals
    });
  } catch (error) {
    logger.error(error);
  }
}
