import nextEnv from '@next/env';
import nodemailer from 'nodemailer';
nextEnv.loadEnvConfig(process.cwd());

const user = process.env.EMAIL_USER?.trim();
const pass = (process.env.EMAIL_PASSWORD ?? '').trim().replace(/\s+/g, '');
const host = process.env.EMAIL_HOST?.trim();
const port = Number(process.env.EMAIL_PORT?.trim() || 587);

console.log('Using host:', host, 'port:', port, 'user:', user, 'pwlen:', pass.length);

const transporter = nodemailer.createTransport({
  host, port, secure: port === 465,
  auth: { user, pass },
});

try {
  await transporter.verify();
  console.log('VERIFY OK — IONOS SMTP login succeeded.');
} catch (e) {
  console.error('VERIFY FAILED:', e.message);
  process.exitCode = 1;
}
