const nodemailer = require('nodemailer');
const { logger } = require('../utils/logger');

let cachedTransport = null;

function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.MAIL_FROM);
}

function getTransport() {
  if (!isMailConfigured()) return null;
  if (!cachedTransport) {
    const port = Number(process.env.SMTP_PORT) || 587;
    cachedTransport = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure: process.env.SMTP_SECURE === 'true' || port === 465,
      auth:
        process.env.SMTP_USER != null && process.env.SMTP_USER !== ''
          ? {
              user: process.env.SMTP_USER,
              pass: process.env.SMTP_PASS || ''
            }
          : undefined
    });
  }
  return cachedTransport;
}

/**
 * @returns {Promise<boolean>} true se enviou (ou SMTP desligado e não era obrigatório)
 */
async function sendAlertEmail({ to, subject, text }) {
  const transport = getTransport();
  if (!transport) {
    logger.warn('Alerta com notificarEmail=true, mas SMTP_HOST/MAIL_FROM não configurados; e-mail não enviado');
    return false;
  }
  try {
    await transport.sendMail({
      from: process.env.MAIL_FROM,
      to,
      subject,
      text
    });
    logger.info(`E-mail de alerta enviado para ${to}`);
    return true;
  } catch (err) {
    logger.error(`Falha ao enviar e-mail de alerta: ${err.message}`);
    return false;
  }
}

module.exports = {
  isMailConfigured,
  sendAlertEmail
};
