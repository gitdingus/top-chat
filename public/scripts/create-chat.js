const roomTypeSelect = document.querySelector('select#room-type');
const createPasswordDiv = document.querySelector('#create-password-div');

setPasswordDivVisibility();
roomTypeSelect.addEventListener('change', setPasswordDivVisibility);

function setPasswordDivVisibility() {
  if (roomTypeSelect.value === 'public') {
    createPasswordDiv.classList.remove('show');
  } else if (roomTypeSelect.value === 'private') {
    createPasswordDiv.classList.add('show');
  }
}