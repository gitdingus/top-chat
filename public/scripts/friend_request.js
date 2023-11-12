const friendRequestForm = document.querySelectorAll('.friend-request');
const friendshipAcceptForm = document.querySelectorAll('.friendship-accept');
const friendshipRejectForm = document.querySelectorAll('.friendship-reject');

if (friendRequestForm.length > 0) {
  friendRequestForm.forEach((form) => {
    form.addEventListener('submit', addFriend);
  });
}

if (friendshipAcceptForm.length > 0) {
  friendshipAcceptForm.forEach((form) => {
    form.addEventListener('submit', acceptFriend);
  });
}

if (friendshipRejectForm.length > 0) {
  friendshipRejectForm.forEach((form) => {
    form.addEventListener('submit', removeFriend);
  });
}

function acceptFriend(e) {
  e.preventDefault();
  const friendId = e.target.friendId.value;

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
  const friendId = e.target.friendId.value;
  
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
  const friendId = e.target.friendId.value;

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