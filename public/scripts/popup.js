const popups = document.querySelectorAll('.popup-parent');

popups.forEach((popupParent) => {
  let hovering = false;
  const trigger = popupParent.querySelector('.popup-trigger');
  const popup = popupParent.querySelector('.popup');
  trigger.addEventListener('pointerover', (pE) => {
    hovering = true;
    setTimeout(() => {
      if (hovering) {
        popup.style.left = `${pE.clientX}px`;
        popup.style.top = `${pE.clientY}px`;

        popup.classList.add('active');
      }
    }, 300);
  });

  trigger.addEventListener('pointerout', (e) => {
    hovering = false;
    setTimeout(() => {
      if (!hovering) {
        popup.classList.remove('active');
      }
    }, 300);
  });

  popup.addEventListener('pointerover', () => {
    hovering = true;
  });

  popup.addEventListener('pointerout', () => {
    hovering = false;
    setTimeout(() => {
      if (!hovering) {
        popup.classList.remove('active');
      }
    }, 300);
  });
});