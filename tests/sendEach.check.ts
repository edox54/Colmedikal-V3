// Runnable check: `npx tsx tests/sendEach.check.ts` — team emails go out one per recipient.
process.env.SMTP_HOST = 'smtp.invalid'; process.env.SMTP_USER = 'u@x.co'; process.env.SMTP_PASS = 'p';
import assert from 'assert';

(async () => {
  const { mailer, sendEach, CLIENT_REPLY_TO } = await import('../src/server/leadMail');
  const sent: any[] = [];
  (mailer as any).sendMail = async (m: any) => { if (m.to === 'bad@x.co') throw new Error('rejected'); sent.push(m); };
  await sendEach(['a@x.co', 'B@x.co', 'a@x.co', 'bad@x.co'], { subject: 's', replyTo: 'cliente@x.co' });
  assert.deepEqual(sent.map(m => m.to), ['a@x.co', 'b@x.co'], 'one message each, deduped');
  assert.ok(sent.every(m => typeof m.to === 'string' && !m.cc && !m.bcc), 'nobody sees other recipients');
  await assert.rejects(sendEach(['bad@x.co'], { subject: 's' }), 'all failed → rejects');
  assert.equal(CLIENT_REPLY_TO, 'info@colmedikal.com');
  console.log('sendEach.check OK');
})().catch(e => { console.error(e); process.exit(1); });
