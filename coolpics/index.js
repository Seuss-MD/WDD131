
const gallery = document.querySelector('.grid');
const modal = document.querySelector('dialog');
const modalImage = modal.querySelector('img');
const closeButton = modal.querySelector('.close-viewer');
const menuButton = document.querySelector('.menu-btn');

// Event listener for opening the modal
gallery.addEventListener('click', openModal);
menuButton.addEventListener('click', openMenu);

function openMenu() {
  let nav = document.querySelector('nav');
  nav.classList.toggle('hide');
}

function openModal(e) { //  e for event parameter
  console.log(e.target);

  const img = e.target;
  const src = img.getAttribute('src');
  const alt = img.getAttribute('alt');
  const full = src.replace('sm', 'full');


  modalImage.src = full;
  modalImage.alt = alt;

  modal.showModal();
// Code to show modal  - Use event parameter 'e'   
    
}
// Close modal on button click
closeButton.addEventListener('click', () => {
    modal.close();
});

// Close modal if clicking outside the image
modal.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.close();
    }
});
          