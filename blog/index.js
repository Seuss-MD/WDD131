const articles = [
  {
    id: 1,
    title: 'Septimus Heap Book One: Magyk',
    date: 'July 5, 2022',
    description:
      'If you enjoy stories about seventh sons of seventh sons and magyk this is the book for you.',
    imgSrc: 'https://upload.wikimedia.org/wikipedia/en/5/5f/Magkycover2.jpg',
    imgAlt: 'Book cover for Septimus Heap 1',
    ages: '10-14',
    genre: 'Fantasy',
    stars: '⭐⭐⭐⭐'
  },
  {
    id: 2,
    title: 'Magnus Chase Book One: Sword of Summer',
    date: 'December 12, 2021',
    description:
      'The anticipated new novel by Rick Riordan. After Greek mythology, Greek/Roman, and Egyptian mythology, Rick decides to try his hand with Norse Mythology, and the end result is good.',
    imgSrc:
      'https://books.google.com/books/content/images/frontcover/xWuyBAAAQBAJ?fife=w300',
    imgAlt: 'Book cover for Magnus Chase 1',
    ages: '12-16',
    genre: 'Fantasy',
    stars: '⭐⭐⭐⭐'
  },
  {
    id: 3,
    title: 'Belgariad Book One: Pawn of Prophecy',
    date: 'Feb 12, 2022',
    description:
      "A fierce dispute among the Gods and the theft of a powerful Orb leaves the World divided into five kingdoms. Young Garion, with his Aunt Pol and an elderly man calling himself Wolf, set out on a complex mission.",
    imgSrc:
      'https://images-na.ssl-images-amazon.com/images/I/41ZxXA+nInL.jpg',
    imgAlt: 'Book cover for Pawn of Prophecy',
    ages: '12-16',
    genre: 'Fantasy',
    stars: '⭐⭐⭐⭐⭐'
  }
];

const bookList = document.querySelector('#book-list');

articles.forEach(function(book) {
  const article = document.createElement('article');
  article.className = 'book-review';

  article.innerHTML = `
    <h2>${book.title}</h2>
    <img src="${book.imgSrc}" alt="${book.imgAlt}">
    <p><em><strong>${book.date}</strong></em></p>
    <p><strong>${book.ages}</strong></p>
    <p><strong>${book.genre}</strong></p>
    <p>
      <span aria-label="${book.stars.length} out of 5 stars" role="img">
        ${book.stars}
      </span>
    </p>
    <p id="desc"><strong>${book.description}</strong></p>
  `;

  bookList.appendChild(article);
});