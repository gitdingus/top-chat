const friendRequestForm = document.querySelector('#friend-request');
if (friendRequestForm !== null) {
  friendRequestForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const friendId = friendRequestForm.friendId.value;
    
    fetch('/users/me/addfriend', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        friendId,
      }),
    })
      .then((res) => {
        console.log(res);
      });
    return false;
  });
}