const uploadImageForm = document.querySelector('#upload-image-form');
const newProfilePic = document.querySelector('#new-profile-pic');
const profilePreview = document.querySelector('#preview-image');

if (newProfilePic.files.length > 0) {
  setProfilePicPreview(newProfilePic.files[0]);
} else {
  profilePreview.textContent = 'No image selected';
}

newProfilePic.addEventListener('change', (e) => {
  setProfilePicPreview(e.target.files[0]);
});

uploadImageForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const form = new FormData(uploadImageForm);
  console.log(form);
  fetch(`/users/me/edit/profile-image`, {
    method: 'post',
    body: form,
  })
    .then((res) => {
      if (res.status === 200) {
        window.location.reload();
      }
    });
  return false;
});

function setProfilePicPreview(file) {
  let preview = document.createElement('img');
  let text = document.createElement('p');

  text.textContent = 'Profile pic preview';

  preview.setAttribute('alt', 'profile pic preview');
  preview.src = URL.createObjectURL(file);
  
  profilePreview.textContent = ''; // clears div
  profilePreview.appendChild(text);
  profilePreview.appendChild(preview);
}