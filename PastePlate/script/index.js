const recipeForm = document.querySelector('#recipe-form');
const inputTitle = document.querySelector('#recipe-title');
const inputCategory = document.querySelector('#recipe-category');
const inputIngredients = document.querySelector('#recipe-ingredients');
const inputInstructions = document.querySelector('#recipe-instructions');
const formMessage = document.querySelector('#form-message');
const card = document.querySelector('.card');
const submitButton = document.querySelector('.btn-submit');
let currentRecipe = null;

const csvHeaders = [
  'Id',
  'Title',
  'Category',
  'Ingredients',
  'Instructions',
  'OriginalText',
  'DateSaved'
];

function getRecipeInput() {
  return {
    title: inputTitle.value.trim(),
    category: inputCategory.value.trim(),
    ingredientsText: inputIngredients.value.trim(),
    instructionsText: inputInstructions.value.trim()
  };
}

function validateRecipeInput(input) {
  if (!input.ingredientsText || !input.instructionsText) {
    formMessage.textContent = 'Enter both ingredients and instructions.';
    recipeForm.reportValidity();
    return false;
  }

  formMessage.textContent = '';
  return true;
}

function createRecipeObject(input) {
  const ingredients = input.ingredientsText
    .split(/\r?\n/)
    .map(line => line.trim().replace(/^[-*]\s*/, ''))
    .filter(Boolean);
  const instructions = input.instructionsText
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(Boolean);
  const fallbackId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return {
    id: window.crypto?.randomUUID?.() || fallbackId,
    title: input.title || 'Untitled Recipe',
    category: input.category || 'None',
    ingredients,
    instructions,
    originalText: `Ingredients:\n${input.ingredientsText}\n\nInstructions:\n${input.instructionsText}`,
    dateSaved: new Date().toISOString()
  };
}

function escapeHTML(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function displayRecipePreview(recipe) {
  card.innerHTML = `
    <h2>Preview</h2>
    <p class="preview-help">Edit any field below before saving.</p>
    <label class="preview-label" for="preview-title">Title:</label>
    <input class="preview-input" id="preview-title" type="text" value="${escapeHTML(recipe.title)}">
    <label class="preview-label" for="preview-category">Category:</label>
    <input class="preview-input" id="preview-category" type="text" value="${escapeHTML(recipe.category)}">
    <label class="preview-label" for="preview-ingredients">Ingredients:</label>
    <textarea class="preview-input" id="preview-ingredients" rows="8">${escapeHTML(recipe.ingredients.join('\n'))}</textarea>
    <label class="preview-label" for="preview-instructions">Instructions:</label>
    <textarea class="preview-input" id="preview-instructions" rows="10">${escapeHTML(recipe.instructions.join('\n'))}</textarea>
    <div class="csv-actions">
      <div class="btn-update btn-download" role="button" tabindex="0">Download Recipe Book</div>
      <div class="btn-update btn-update-existing" role="button" tabindex="0">Add to Existing Recipe Book</div>
    </div>
  `;
  card.style.display = 'flex';
}

function syncPreviewToRecipe() {
  const ingredientsText = card.querySelector('#preview-ingredients').value.trim();
  const instructionsText = card.querySelector('#preview-instructions').value.trim();

  currentRecipe.title = card.querySelector('#preview-title').value.trim() || 'Untitled Recipe';
  currentRecipe.category = card.querySelector('#preview-category').value.trim() || 'None';
  currentRecipe.ingredients = ingredientsText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  currentRecipe.instructions = instructionsText.split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  currentRecipe.originalText = `Ingredients:\n${ingredientsText}\n\nInstructions:\n${instructionsText}`;
}

function formatCSVValue(value) {
  return `"${String(value ?? '').replaceAll('"', '""')}"`;
}

function recipeValues(recipe) {
  return {
    id: recipe.id,
    title: recipe.title,
    category: recipe.category,
    ingredients: recipe.ingredients.join('\n'),
    instructions: recipe.instructions.join('\n'),
    directions: recipe.instructions.join('\n'),
    originaltext: recipe.originalText,
    datesaved: recipe.dateSaved
  };
}

function recipeRowForHeaders(recipe, headers) {
  const values = recipeValues(recipe);
  return headers.map(header => formatCSVValue(values[header.trim().toLowerCase()] ?? '')).join(',');
}

function convertRecipesToCSV(recipes) {
  const normalizedHeaders = csvHeaders.map(header => header.toLowerCase());
  const rows = recipes.map(recipe => recipeRowForHeaders(recipe, normalizedHeaders));
  return `${csvHeaders.join(',')}\n${rows.join('\n')}`;
}

function downloadUpdatedCSV() {
  const blob = new Blob(['\uFEFF', convertRecipesToCSV([currentRecipe])], {
    type: 'text/csv;charset=utf-8'
  });
  const downloadURL = URL.createObjectURL(blob);
  const downloadLink = document.createElement('a');
  downloadLink.href = downloadURL;
  downloadLink.download = 'recipeBook.csv';
  document.body.appendChild(downloadLink);
  downloadLink.click();
  downloadLink.remove();
  URL.revokeObjectURL(downloadURL);
}

function parseHeaderRow(csvText) {
  const firstLine = csvText.replace(/^\uFEFF/, '').split(/\r?\n/, 1)[0];
  return firstLine.split(',').map(header => header.replace(/^"|"$/g, '').trim());
}

function parseCSVText(csvText) {
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
      if (character === '\r' && csvText[index + 1] === '\n') index += 1;
      row.push(value);
      if (row.some(cell => cell.trim())) rows.push(row);
      row = [];
      value = '';
    } else {
      value += character;
    }
  }

  row.push(value);
  if (row.some(cell => cell.trim())) rows.push(row);
  return rows;
}

function recipesFromExistingCSV(csvText) {
  const rows = parseCSVText(csvText);
  const headers = rows[0].map(header => header.replace(/^\uFEFF/, '').trim().toLowerCase());
  const getIndex = name => headers.indexOf(name);
  const titleIndex = getIndex('title');
  const categoryIndex = getIndex('category');
  const directionsIndex = getIndex('directions');
  const instructionsIndex = getIndex('instructions');

  return rows.slice(1).map((row, index) => {
    const instructions = row[instructionsIndex === -1 ? directionsIndex : instructionsIndex] || '';
    return {
      id: `legacy-${Date.now()}-${index}`,
      title: row[titleIndex] || 'Untitled Recipe',
      category: row[categoryIndex] || 'None',
      ingredients: [],
      instructions: instructions.split(/\r?\n/).filter(Boolean),
      originalText: instructions,
      dateSaved: ''
    };
  });
}

async function addRecipeToCSVData() {
  if (!window.showOpenFilePicker) {
    alert('Updating a file directly is not supported in this browser. Try Chrome or Edge.');
    return;
  }

  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{ description: 'CSV files', accept: { 'text/csv': ['.csv'] } }],
      multiple: false
    });
    const file = await fileHandle.getFile();
    const currentCSV = await file.text();
    let headers = csvHeaders;
    let needsUpgrade = false;

    if (file.size !== 0 && currentCSV.replace(/^\uFEFF/, '').trim() !== '') {
      headers = parseHeaderRow(currentCSV);
      const supportedHeaders = headers.map(header => header.toLowerCase());
      if (!supportedHeaders.includes('title') || !supportedHeaders.includes('category')) {
        throw new Error('The selected CSV needs Title and Category columns.');
      }
      needsUpgrade = !supportedHeaders.includes('ingredients');
    }

    const writable = await fileHandle.createWritable({ keepExistingData: true });
    if (file.size === 0 || currentCSV.replace(/^\uFEFF/, '').trim() === '') {
      await writable.seek(0);
      await writable.write(`\uFEFF${convertRecipesToCSV([currentRecipe])}`);
    } else if (needsUpgrade) {
      const recipes = recipesFromExistingCSV(currentCSV);
      recipes.push(currentRecipe);
      await writable.truncate(0);
      await writable.write(`\uFEFF${convertRecipesToCSV(recipes)}`);
    } else {
      await writable.seek(file.size);
      const separator = /\r?\n$/.test(currentCSV) ? '' : '\n';
      await writable.write(`${separator}${recipeRowForHeaders(currentRecipe, headers)}`);
    }

    await writable.close();
    alert(`${file.name} was updated successfully.`);
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Could not update the CSV file:', error);
      alert(error.message || 'The CSV file could not be updated.');
    }
  }
}

recipeForm.addEventListener('submit', event => {
  event.preventDefault();
  const input = getRecipeInput();
  if (!validateRecipeInput(input)) return;

  currentRecipe = createRecipeObject(input);
  displayRecipePreview(currentRecipe);
});

submitButton.addEventListener('click', () => recipeForm.requestSubmit());

submitButton.addEventListener('keydown', event => {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    submitButton.click();
  }
});

card.addEventListener('click', event => {
  if (event.target.matches('.btn-download')) {
    syncPreviewToRecipe();
    downloadUpdatedCSV();
  }
  if (event.target.matches('.btn-update-existing')) {
    syncPreviewToRecipe();
    addRecipeToCSVData();
  }
});

card.addEventListener('keydown', event => {
  if ((event.key === 'Enter' || event.key === ' ') &&
      event.target.matches('.btn-download, .btn-update-existing')) {
    event.preventDefault();
    event.target.click();
  }
});
