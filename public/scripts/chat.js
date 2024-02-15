const sectionButtons = document.querySelectorAll('.section-btn');
const sections = document.querySelectorAll('.section');
const publicRoomsButton = document.querySelector('#public-rooms-btn');
const recentRoomsButton = document.querySelector('#recent-rooms-btn');
const myRoomsButton = document.querySelector('#my-rooms-btn');
const privateRoomsButton = document.querySelector('#private-rooms-btn');
const createChatButton = document.querySelector('#create-chat-btn');
const publicSection = document.querySelector('#public');
const recentlyVisitedSection = document.querySelector('#recently-visited');
const myRoomsSection = document.querySelector('#my');
const privateRoomsSection = document.querySelector('#private-rooms');
const createChatSection = document.querySelector('#create-chat');

const clearActiveSelection = () => {
  sectionButtons.forEach((btn) => btn.classList.remove('active'));
  sections.forEach((section) => section.classList.remove('active'));
}

publicRoomsButton.addEventListener('click', () => {
  clearActiveSelection();
  publicRoomsButton.classList.add('active');
  publicSection.classList.add('active');
});

recentRoomsButton.addEventListener('click', () => {
  clearActiveSelection();
  recentRoomsButton.classList.add('active');
  recentlyVisitedSection.classList.add('active');
});

myRoomsButton.addEventListener('click', () => {
  clearActiveSelection();
  myRoomsButton.classList.add('active');
  myRoomsSection.classList.add('active');
});

privateRoomsButton.addEventListener('click', () => {
  clearActiveSelection();
  privateRoomsButton.classList.add('active');
  privateRoomsSection.classList.add('active');
});

createChatButton.addEventListener('click', () => {
  clearActiveSelection();
  createChatButton.classList.add('active');
  createChatSection.classList.add('active');
});

