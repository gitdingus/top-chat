const categories = document.querySelectorAll('.category');

if (categories.length > 0) {
  categories.forEach((category) => {
    const expandBtn = category.querySelector('button.expand-section');

    expandBtn.addEventListener('click', () => {
      if (category.classList.contains('expanded')) {
        category.classList.remove('expanded');
      } else {
        category.classList.add('expanded');
      }
    });
  });
}