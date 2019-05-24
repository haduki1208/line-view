const functions = require('firebase-functions');
const line = require('@line/bot-sdk');

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET
};
const client = new line.Client(config);

exports.getLineViewGames = functions.https.onRequest((req, res) => {
  // body-parserにより期待したrawBodyの値を受け取れないため、validateSignatureを強制的に実行する。
  const signature = req.get('x-line-signature');
  if (
    !signature ||
    !line.validateSignature(req.rawBody, config.channelSecret, signature)
  ) {
    throw new line.SignatureValidationFailed(
      'Signature validation failed.',
      signature || 'Unknown.'
    );
  }

  Promise.all(req.body.events.map(handleEvent))
    .then(result => res.json(result))
    .catch(err => {
      console.error(err);
      res.status(500).end();
    });
});

function handleEvent(event) {
  if (event.type !== 'beacon' || event.beacon.type !== 'enter') {
    const reply = makeReplyTextMassage(
      '空からインベーダーゲームを配信中！ \n【リンク】\nline://app/1597382549-7akeWQwg'
    );
    return client.replyMessage(event.replyToken, reply);
  }

  const reply = [
    makeReplyTextMassage(
      '空からゲームを配信中！\nこの時間は インベーダーゲーム をお届けします！\n【リンク】\nline://app/1597382549-7akeWQwg'
    ),
    makeReplyImageMassage()
  ];
  return client.replyMessage(event.replyToken, reply);
}

function makeReplyTextMassage(text) {
  return {
    type: 'text',
    text: text
  };
}

function makeReplyImageMassage() {
  return {
    type: 'image',
    originalContentUrl:
      'https://fir-test-b6b7b.firebaseapp.com/invader_logo.jpeg',
    previewImageUrl:
      'https://fir-test-b6b7b.firebaseapp.com/invader_logo_mini.jpeg'
  };
}
