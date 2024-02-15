const deleteImageForm = document.querySelector('#delete-image-form');

if (deleteImageForm) {
  deleteImageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    fetch('/users/me/edit/profile-image', {
      method: 'delete'
    })
      .then((res) => {
        if (res.status === 200) {
          window.location.reload();
        }
      });
    return false;
  });
}