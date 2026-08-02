const form = document.getElementById('searchForm');
const input = document.getElementById('searchInput');
const status = document.getElementById('searchStatus');
const results = document.getElementById('searchResults');

let pagefind;
let debounceTimer;

async function loadPagefind() {
  if (!pagefind) {
    pagefind = await import('/pagefind/pagefind.js');
    await pagefind.init();
  }
  return pagefind;
}

function renderExcerpt(container, excerptHtml) {
  const template = document.createElement('template');
  template.innerHTML = excerptHtml;

  for (const node of template.content.childNodes) {
    if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'MARK') {
      const mark = document.createElement('mark');
      mark.textContent = node.textContent;
      container.append(mark);
    } else {
      container.append(document.createTextNode(node.textContent));
    }
  }
}

async function runSearch(query) {
  results.replaceChildren();

  if (!query) {
    status.textContent = 'Start typing to see results.';
    return;
  }

  status.textContent = 'Searching…';

  const pf = await loadPagefind();
  const search = await pf.search(query);

  if (!search.results.length) {
    status.textContent = `No results for "${query}".`;
    return;
  }

  status.textContent = `${search.results.length} result${search.results.length === 1 ? '' : 's'} for "${query}".`;

  for (const result of search.results) {
    const data = await result.data();

    const li = document.createElement('li');
    li.className = 'search-results__item';

    const link = document.createElement('a');
    link.href = data.url;
    link.textContent = data.meta && data.meta.title ? data.meta.title : data.url;

    const excerpt = document.createElement('p');
    renderExcerpt(excerpt, data.excerpt);

    li.append(link, excerpt);
    results.append(li);
  }
}

form.addEventListener('submit', (event) => {
  event.preventDefault();
  clearTimeout(debounceTimer);
  runSearch(input.value.trim());
});

input.addEventListener('input', () => {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(() => runSearch(input.value.trim()), 250);
});
