const loadButton = document.querySelector('.btn-load');
const fileInput = document.querySelector('#csv-file');
const loadMessage = document.querySelector('#load-message');
const recipeBook = document.querySelector('.recipe-book');
const searchModal = document.querySelector('#search-modal');
const searchButton = document.querySelector('.btn-search');
const closeSearchButton = document.querySelector('.btn-close-search');
const searchInput = document.querySelector('#search');
const searchTerms = document.querySelector('#search-terms');
const recipeModal = document.querySelector('#recipe-modal');
const closeRecipeButton = document.querySelector('.btn-close-recipe');
const modalTitle = document.querySelector('#recipe-modal-title');
const modalCategory = document.querySelector('#recipe-modal-category');
const modalIngredients = document.querySelector('#recipe-modal-ingredients');
const modalInstructions = document.querySelector('#recipe-modal-instructions');
let loadedRecipes = [];

function addKeyboardClick(element) {
  element.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      element.click();
    }
  });
}

[loadButton, searchButton, closeSearchButton, closeRecipeButton].forEach(addKeyboardClick);

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
  const columnIndex = name => headers.indexOf(name);
  const titleIndex = columnIndex('title');
  const categoryIndex = columnIndex('category');
  const ingredientsIndex = columnIndex('ingredients');
  const instructionsIndex = columnIndex('instructions');
  const directionsIndex = columnIndex('directions');
  const originalTextIndex = columnIndex('originaltext');
  const idIndex = columnIndex('id');
  const dateSavedIndex = columnIndex('datesaved');

  if (titleIndex === -1 || categoryIndex === -1 ||
      (instructionsIndex === -1 && directionsIndex === -1)) {
    throw new Error('The CSV must have Title, Category, and Instructions or Directions columns.');
  }

  return rows.slice(1).map(row => ({
    id: idIndex === -1 ? '' : row[idIndex]?.trim() || '',
    title: row[titleIndex]?.trim() || 'Untitled Recipe',
    category: row[categoryIndex]?.trim() || 'None',
    ingredients: ingredientsIndex === -1 ? '' : row[ingredientsIndex]?.trim() || '',
    directions: row[instructionsIndex === -1 ? directionsIndex : instructionsIndex]?.trim() ||
      'No directions provided.',
    originalText: originalTextIndex === -1 ? '' : row[originalTextIndex]?.trim() || '',
    dateSaved: dateSavedIndex === -1 ? '' : row[dateSavedIndex]?.trim() || ''
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
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `View ${recipe.title}`);

    const cardHeader = document.createElement('header');
    cardHeader.className = 'recipe-card-header';
    addCardText(cardHeader, 'h3', recipe.title);
    addCardText(cardHeader, 'span', recipe.category, 'category-badge');
    card.appendChild(cardHeader);

    const ingredientSection = document.createElement('section');
    ingredientSection.className = 'recipe-card-section';
    addCardText(ingredientSection, 'h4', 'Ingredients');

    if (recipe.ingredients) {
      const ingredientList = document.createElement('ul');
      recipe.ingredients.split(/\r?\n/).filter(Boolean).forEach(ingredient => {
        addCardText(ingredientList, 'li', ingredient.trim());
      });
      ingredientSection.appendChild(ingredientList);
    } else {
      addCardText(ingredientSection, 'p', 'No ingredients saved for this recipe.', 'empty-ingredients');
    }
    card.appendChild(ingredientSection);

    card.addEventListener('click', () => openRecipeModal(recipe));
    card.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        openRecipeModal(recipe);
      }
    });

    recipeBook.appendChild(card);
  });
}

function fillModalList(list, text, emptyMessage) {
  list.replaceChildren();
  const items = text.split(/\r?\n/).map(item => item.trim()).filter(Boolean);

  if (items.length === 0) {
    addCardText(list, 'li', emptyMessage, 'modal-empty');
    return;
  }

  items.forEach(item => addCardText(list, 'li', item));
}

function openRecipeModal(recipe) {
  modalTitle.textContent = recipe.title;
  modalCategory.textContent = recipe.category;
  fillModalList(modalIngredients, recipe.ingredients || '', 'No ingredients saved.');
  fillModalList(modalInstructions, recipe.directions || '', 'No instructions saved.');
  recipeModal.showModal();
}

closeRecipeButton.addEventListener('click', () => recipeModal.close());

recipeModal.addEventListener('click', event => {
  if (event.target === recipeModal) recipeModal.close();
});

function filterRecipes() {
  const query = searchInput.value.trim().toLowerCase();
  const property = searchTerms.value;
  const matches = loadedRecipes.filter(recipe =>
    (recipe[property] || '').toLowerCase().includes(query)
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
