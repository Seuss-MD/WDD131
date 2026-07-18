let inputTitle = document.querySelector('#recipe-title');
let inputCategory = document.querySelector('#recipe-category');
let inputRawText = document.querySelector('#recipe-text');

let card = document.querySelector('.card');
let btnSubmit = document.querySelector('.btn-submit');

function formatCSVValue(value) {
  return `"${value.replaceAll('"', '""')}"`;
}

function formattingCSV() {
  const title = inputTitle.value.trim() || 'Untitled Recipe';
  const category = inputCategory.value.trim() || 'None';
  const rawText = inputRawText.value.trim() || 'Missing';

  const header = ['Title', 'Category', 'Directions'];

  const recipe = [
    formatCSVValue(title),
    formatCSVValue(category),
    formatCSVValue(rawText)
  ];

  return `${header.join(',')}\n${recipe.join(',')}`;
}

function formatRecipeRow() {
  const title = inputTitle.value.trim() || 'Untitled Recipe';
  const category = inputCategory.value.trim() || 'None';
  const rawText = inputRawText.value.trim() || 'Missing';

  return [title, category, rawText].map(formatCSVValue).join(',');
}

function downloadCSV() {
  const csv = formattingCSV();

  // Add a UTF-8 marker so spreadsheet programs read characters correctly.
  const blob = new Blob(['\uFEFF', csv], {
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

async function updateExistingCSV() {
  if (!window.showOpenFilePicker) {
    alert('Updating a file directly is not supported in this browser. Try Chrome or Edge.');
    return;
  }

  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [{
        description: 'CSV files',
        accept: { 'text/csv': ['.csv'] }
      }],
      multiple: false
    });

    const file = await fileHandle.getFile();
    const currentCSV = await file.text();
    const writable = await fileHandle.createWritable({ keepExistingData: true });

    if (file.size === 0 || currentCSV.replace(/^\uFEFF/, '').trim() === '') {
      await writable.seek(0);
      await writable.write(`\uFEFF${formattingCSV()}`);
    } else {
      await writable.seek(file.size);
      const separator = /\r?\n$/.test(currentCSV) ? '' : '\n';
      await writable.write(`${separator}${formatRecipeRow()}`);
    }

    await writable.close();

    alert(`${file.name} was updated successfully.`);
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error('Could not update the CSV file:', error);
      alert('The CSV file could not be updated.');
    }
  }
}

function recipesTemplate() {
  const title = inputTitle.value.trim() || 'Untitled Recipe';
  const category = inputCategory.value.trim() || 'None';
  const rawText = inputRawText.value.trim() || 'Missing';

  return `
    <h2>Preview</h2>
    <h3 id="card-title">${title}</h3>
    <p id="card-category">Category: ${category}</p>
    <p id="card-directions">Directions:<br>${rawText}</p>

    <div class="csv-actions">
      <button type="button" class="btn-update btn-download">
        Download Recipe Book
      </button>
      <button type="button" class="btn-update btn-update-existing">
        Add to Existing Recipe Book
      </button>
    </div>
  `;
}

btnSubmit.addEventListener('click', function (event) {
  event.preventDefault();

  card.style.display = 'flex';
  card.innerHTML = recipesTemplate();
});

card.addEventListener('click', function (event) {
  if (event.target.matches('.btn-download')) {
    downloadCSV();
  }

  if (event.target.matches('.btn-update-existing')) {
    updateExistingCSV();
  }
});
