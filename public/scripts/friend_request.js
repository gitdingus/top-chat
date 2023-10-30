const friendForms = document.querySelector('#friend-forms');
const friendRequestForm = document.querySelector('#friend-request');
const friendshipAcceptForm = document.querySelector('#friendship-accept');
const friendshipRejectForm = document.querySelector('#friendship-reject');

if (friendRequestForm !== null) {
  friendRequestForm.addEventListener('submit', addFriend);
}

if (friendshipAcceptForm !== null) {
  friendshipAcceptForm.addEventListener('submit', acceptFriend);
}

if (friendshipRejectForm !== null) {
  friendshipRejectForm.addEventListener('submit', removeFriend);
}

function acceptFriend(e) {
  e.preventDefault();
  const friendId = friendshipAcceptForm.friendId.value;

  fetch('/users/me/acceptfriend', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      friendId,
    }),
  })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error('request failed');
      }
    })
    .then((data) => {
      if (data.msg === 'success') {
        window.location.reload();
      } else {
        throw new Error('request failed');
      }
    })
    .catch((err) => {
      alert('There was an error processing your request');
    });

  return false;
}

function addFriend(e) {
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
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error('request failed');
      }
    })
    .then((data) => {
      if (data.msg === 'success') {
        window.location.reload();
      } else {
        throw new Error('request failed');
      }
    })
    .catch((err) => {
      alert('There was an error processing your request');
    });
  return false;
}

function removeFriend(e) {
  e.preventDefault();
  const friendId = friendshipRejectForm.friendId.value;

  fetch('/users/me/rejectfriend', {
    method: 'post',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      friendId,
    }),
  })
    .then((res) => {
      if (res.status === 200) {
        return res.json();
      } else {
        throw new Error('request failed');
      }
    })
    .then((data) => {
      if (data.msg === 'success') {
        window.location.reload();
      } else {
        throw new Error('request failed');
      }
    })
    .catch((err) => {
      alert('There was an error processing your request');
    });
    
  return false;
}