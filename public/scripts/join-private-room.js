const joinRoomForm = document.querySelector('#join-private-room');

if (joinRoomForm) {
  joinRoomForm.addEventListener('submit', (e) => {
    joinRoomForm.action = `/chat/${joinRoomForm.chatId.value}`;
  });
}