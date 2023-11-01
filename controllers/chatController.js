const { getFriends } = require('../db/user.js');
const { getChat } = require('../db/chat.js');
const clients = {};

exports.get_chat_index = [
  async (req, res, next) => {
    await getFriends(req.user);

    res.render('chat', {
      user: req.user,
    });
  },
];

exports.get_chat = [
  async (req, res, next) => {
    const [ populateFriendsVoid, chat ] = await Promise.all([
      getFriends(req.user),
      getChat(req.params.chatId),
    ]);

    res.render('chat-room', {
      user: req.user,
      chat,
    });
  }
];

exports.ws_chat_visited = function (ws, req) {
  const { chatId } = req.params;
  if (clients[chatId] === undefined) {
    clients[chatId] = [];
  }
  clients[chatId].push(ws);

  ws.on('close', () => {
    const clientIndex = clients[chatId].findIndex((client) => client === ws);
    clients[chatId].splice(clientIndex, 1);
  });

  ws.on('message', (msgJSON) => {
    const msg = JSON.parse(msgJSON);

    console.log(msg);
    // clients[chatId].forEach((client) => {
    //   client.send(msg);
    // })
  });
};
