const friendRequestForm = document.querySelector('#friend-request');
const friendshipAcceptForm = document.querySelector('#friendship-accept');
const friendshipRejectForm = document.querySelector('#friendship-reject');

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

if (friendshipAcceptForm !== null) {
  friendshipAcceptForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const friendId = friendshipAcceptForm.friendId.value;
    console.log('accept friendship');
    fetch('/users/me/acceptfriend', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        friendId,
      }),
    })
      .then((res) => console.log(res));

    return false;
  })
}

if (friendshipRejectForm !== null) {
  friendshipRejectForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const friendId = friendshipRejectForm.friendId.value;
    console.log('reject friendship');

    fetch('/users/me/rejectfriend', {
      method: 'post',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        friendId,
      }),
    })
      .then((res) => console.log(res));
      
    return false;
  })
}