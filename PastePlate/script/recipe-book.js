const loadButton = document.querySelector('.btn-load');
const fileInput = document.querySelector('#csv-file');
const loadMessage = document.querySelector('#load-message');
const recipeBook = document.querySelector('.recipe-book');
const searchModal = document.querySelector('#search-modal');
const searchButton = document.querySelector('.btn-search');
const closeSearchButton = document.querySelector('.btn-close-search');
const searchInput = document.querySelector('#search');
const searchTerms = document.querySelector('#search-terms');
let loadedRecipes = [];

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = '';
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];

    if (character === '"') {
      if (insideQuotes && csvText[index + 1] === '"') {
        value += '"';
        index += 1;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (character === ',' && !insideQuotes) {
      row.push(value);
      value = '';
    } else if ((character === '\n' || character === '\r') && !insideQuotes) {
      if (character === '\r' && csvText[index + 1] === '\n') {
        index += 1;
      }
      row.push(value);
      if (row.some(cell => cell.trim() !== '')) {
        rows.push(row);
      }
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some(cell => cell.trim() !== '')) {
    rows.push(row);
  }

  return rows;
}

function rowsToRecipes(rows) {
  if (rows.length < 2) {
    return [];
  }

  const headers = rows[0].map(header =>
    header.replace(/^\uFEFF/, '').trim().toLowerCase()
  );
  const titleIndex = headers.indexOf('title');
  const categoryIndex = headers.indexOf('category');
  const directionsIndex = headers.indexOf('directions');

  if (titleIndex === -1 || categoryIndex === -1 || directionsIndex === -1) {
    throw new Error('The CSV must have Title, Category, and Directions columns.');
  }

  return rows.slice(1).map(row => ({
    title: row[titleIndex]?.trim() || 'Untitled Recipe',
    category: row[categoryIndex]?.trim() || 'None',
    directions: row[directionsIndex]?.trim() || 'No directions provided.'
  }));
}

function addCardText(card, elementName, content, className = '') {
  const element = document.createElement(elementName);
  element.textContent = content;
  element.className = className;
  card.appendChild(element);
}

function displayRecipes(recipes) {
  recipeBook.replaceChildren();

  if (recipes.length === 0) {
    addCardText(recipeBook, 'h3', 'No Recipes Found');
    return;
  }

  recipes.forEach(recipe => {
    const card = document.createElement('article');
    card.className = 'recipe-card';

    addCardText(card, 'h3', recipe.title);
    addCardText(card, 'p', `Category: ${recipe.category}`);
    addCardText(card, 'p', 'Directions:', 'directions-label');
    addCardText(card, 'p', recipe.directions, 'directions-text');
    recipeBook.appendChild(card);
  });
}

function filterRecipes() {
  const query = searchInput.value.trim().toLowerCase();
  const property = searchTerms.value;
  const matches = loadedRecipes.filter(recipe =>
    recipe[property].toLowerCase().includes(query)
  );
  displayRecipes(matches);
}

searchButton.addEventListener('click', () => {
  searchModal.showModal();
  searchInput.focus();
});

closeSearchButton.addEventListener('click', () => searchModal.close());

searchModal.addEventListener('click', event => {
  if (event.target === searchModal) {
    searchModal.close();
  }
});

searchInput.addEventListener('input', filterRecipes);
searchTerms.addEventListener('change', filterRecipes);

loadButton.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', async () => {
  const file = fileInput.files[0];
  if (!file) return;

  try {
    const recipes = rowsToRecipes(parseCSV(await file.text()));
    loadedRecipes = recipes;
    searchInput.value = '';
    displayRecipes(loadedRecipes);
    loadMessage.textContent = `${recipes.length} recipe${recipes.length === 1 ? '' : 's'} loaded from ${file.name}.`;
  } catch (error) {
    loadedRecipes = [];
    displayRecipes([]);
    loadMessage.textContent = error.message || 'The CSV file could not be loaded.';
  } finally {
    fileInput.value = '';
  }
});
