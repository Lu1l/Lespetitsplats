let recipes = [];
const recipesPerPage = 3;
let currentPage = 1;

let activeFilters = {
  search: '',
  ingredients: new Set(),
  appliances: new Set(),
  ustensils: new Set()
};

async function getDataJson() {
  try {
    const response = await fetch('data/recipes.json');
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Erreur lors du chargement des recettes:', error);
    return null;
  }
}

function recipeCardGenerator(recipe, container) {
  const card = document.createElement('div');
  card.className = 'col-md-4 mb-4';
  
  const cardContent = `
    <div class="card h-100" style="position: relative;">
      <img src="assets/${recipe.image}" class="card-img-top" alt="${recipe.name}" style="height: 200px; object-fit: cover;">
      <div class="time-badge" style="position: absolute; top: 10px; right: 10px; background-color: #FFD15B; padding: 5px; border-radius: 5px;">
        ${recipe.time} min
      </div>
      <div class="card-header bg-light d-flex justify-content-between align-items-center">
        <h5 class="card-title mb-0">${recipe.name}</h5>
      </div>
      <div class="card-body">
        <div class="row">
          <div class="col-12">
          
            <h6>Instructions:</h6>
            <p class="card-text">${recipe.description}</p>
          </div>
          <div class="col">
            <h6>Ingrédients:</h6>
            <ul class="list-unstyled row" style="margin: 0;">
              ${recipe.ingredients.map((ing) => `
                <li class="col-6 mb-2" style="display: flex; justify-content: space-between;">
                  <strong>${ing.ingredient}</strong>
                  <span>${ing.quantity ? `${ing.quantity} ${ing.unit || ''}` : ''}</span>
                </li>
              `).join('')}
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;
  
  card.innerHTML = cardContent;
  container.appendChild(card);
}

function displayData(filteredRecipes) {
  const recipeSection = document.querySelector('#recipe-container');
  recipeSection.innerHTML = '';
  
  if (filteredRecipes.length === 0) {
    recipeSection.innerHTML = '<div class="alert alert-info">Aucune recette trouvée</div>';
    return;
  }

 
  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  const paginatedRecipes = filteredRecipes.slice(startIndex, endIndex);

 
  const row = document.createElement('div');
  row.className = 'row';


  paginatedRecipes.forEach(recipe => recipeCardGenerator(recipe, row));
  
  recipeSection.appendChild(row);

  
  createPaginationControls(filteredRecipes);
}

function createPaginationControls(filteredRecipes) {
  const paginationContainer = document.querySelector('#pagination-container') || createPaginationContainer();
  paginationContainer.innerHTML = '';

  const totalPages = Math.ceil(filteredRecipes.length / recipesPerPage);


  const prevButton = document.createElement('button');
  prevButton.className = 'btn btn-outline-primary me-2';
  prevButton.textContent = 'Précédent';
  prevButton.disabled = currentPage === 1;
  prevButton.addEventListener('click', () => {
    if (currentPage > 1) {
      currentPage--;
      displayData(filteredRecipes);
    }
  });

  
  const nextButton = document.createElement('button');
  nextButton.className = 'btn btn-outline-primary';
  nextButton.textContent = 'Suivant';
  nextButton.disabled = currentPage === totalPages;
  nextButton.addEventListener('click', () => {
    if (currentPage < totalPages) {
      currentPage++;
      displayData(filteredRecipes);
    }
  });

  
  const pageInfo = document.createElement('span');
  pageInfo.className = 'mx-2';
  pageInfo.textContent = `Page ${currentPage} sur ${totalPages}`;


  paginationContainer.appendChild(prevButton);
  paginationContainer.appendChild(pageInfo);
  paginationContainer.appendChild(nextButton);
}

function createPaginationContainer() {
  const container = document.createElement('div');
  container.id = 'pagination-container';
  container.className = 'text-center mt-3 d-flex justify-content-center align-items-center';
  document.querySelector('#recipe-container').after(container);
  return container;
}

function applyFilters() {

  currentPage = 1;

  let filteredRecipes = recipes;

 
  if (activeFilters.search) {
    const searchQuery = activeFilters.search.toLowerCase();
    filteredRecipes = filteredRecipes.filter(recipe => {
      const nameMatch = recipe.name.toLowerCase().includes(searchQuery);
      const descriptionMatch = recipe.description.toLowerCase().includes(searchQuery);
      const ingredientMatch = recipe.ingredients.some(ing => 
        ing.ingredient.toLowerCase().includes(searchQuery)
      );
      return nameMatch || descriptionMatch || ingredientMatch;
    });
  }

 
  if (activeFilters.ingredients.size > 0) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      [...activeFilters.ingredients].every(ingredient =>
        recipe.ingredients.some(ing => ing.ingredient === ingredient)
      )
    );
  }

 
  if (activeFilters.appliances.size > 0) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      [...activeFilters.appliances].some(appliance =>
        recipe.appliance === appliance
      )
    );
  }


  if (activeFilters.ustensils.size > 0) {
    filteredRecipes = filteredRecipes.filter(recipe =>
      [...activeFilters.ustensils].every(ustensil =>
        recipe.ustensils.includes(ustensil)
      )
    );
  }

  displayData(filteredRecipes);
  updateFilterTags();
}

function updateFilterTags() {
  const filterTagsContainer = document.querySelector('#filter-tags') || createFilterTagsContainer();
  const paginationContainer = document.querySelector('#pagination-container');

  
  if (!filterTagsContainer.parentNode) {
    paginationContainer.after(filterTagsContainer);
  }

  filterTagsContainer.innerHTML = '';

  function createTag(value, type) {
    const tag = document.createElement('span');
    tag.className = 'badge me-2 mb-2';
    tag.style.backgroundColor = '#FFD15B';
    tag.style.fontSize = '1.1em';
    tag.textContent = value;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'btn-close btn-close-dark ms-2';
    closeBtn.style.fontSize = '0.65em';
    closeBtn.addEventListener('click', () => removeFilter(value, type));
    
    tag.appendChild(closeBtn);
    return tag;
  }


  activeFilters.ingredients.forEach(ingredient => {
    filterTagsContainer.appendChild(createTag(ingredient, 'ingredients'));
  });

  activeFilters.appliances.forEach(appliance => {
    filterTagsContainer.appendChild(createTag(appliance, 'appliances'));
  });

  activeFilters.ustensils.forEach(ustensil => {
    filterTagsContainer.appendChild(createTag(ustensil, 'ustensils'));
  });
}

function createFilterTagsContainer() {
  const container = document.createElement('div');
  container.id = 'filter-tags';
  container.className = 'mt-3';
  
 
  const buttonContainer = document.querySelector('.d-flex.gap-2');
  buttonContainer.after(container);
  
  return container;
}

function removeFilter(value, type) {
  activeFilters[type].delete(value);
  applyFilters();
}

function populateDropdowns(recipes) {
  const ingredientsDropdown = document.querySelector('.dropdown-menu:nth-of-type(1)');
  const appareilsDropdown = document.getElementById('Appareils_dropdown');
  const ustensilesDropdown = document.getElementById('Ustensiles_drowdown');

 
  ingredientsDropdown.innerHTML = '';
  appareilsDropdown.innerHTML = '';
  ustensilesDropdown.innerHTML = '';


  const ingredientsSet = new Set();
  const appareilsSet = new Set();
  const ustensilesSet = new Set();

  recipes.forEach(recipe => {
    recipe.ingredients.forEach(ingredient => ingredientsSet.add(ingredient.ingredient));
    if (recipe.appliance) appareilsSet.add(recipe.appliance);
    if (recipe.ustensils) recipe.ustensils.forEach(ustensil => ustensilesSet.add(ustensil));
  });

  function createDropdownItem(item, type) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'dropdown-item';
    a.href = '#';
    a.textContent = item;
    

    if (activeFilters[type].has(item)) {
      a.classList.add('active');
    }
    
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const isActive = activeFilters[type].has(item);
      
      if (isActive) {
        activeFilters[type].delete(item);
        e.target.classList.remove('active');
      } else {
        activeFilters[type].add(item);
        e.target.classList.add('active');
      }
      
      applyFilters();
    });
    
    li.appendChild(a);
    return li;
  }

  
  ingredientsSet.forEach(ingredient => {
    ingredientsDropdown.appendChild(createDropdownItem(ingredient, 'ingredients'));
  });

  appareilsSet.forEach(appliance => {
    appareilsDropdown.appendChild(createDropdownItem(appliance, 'appliances'));
  });

  ustensilesSet.forEach(ustensile => {
    ustensilesDropdown.appendChild(createDropdownItem(ustensile, 'ustensils'));
  });


  const dropdowns = [
    { element: ingredientsDropdown, type: 'ingredients' },
    { element: appareilsDropdown, type: 'appliances' },
    { element: ustensilesDropdown, type: 'ustensils' }
  ];

  dropdowns.forEach(({ element, type }) => {
    const resetLi = document.createElement('li');
    const resetButton = document.createElement('button');
    resetButton.className = 'dropdown-item text-primary';
    resetButton.textContent = 'Réinitialiser';
    
    resetButton.addEventListener('click', () => {
      activeFilters[type].clear();
      element.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
      });
      applyFilters();
    });
    
    resetLi.appendChild(resetButton);
    element.appendChild(resetLi);
  });
}

async function init() {
  const loadedRecipes = await getDataJson();
  if (!loadedRecipes) {
    console.error("Impossible de charger les recettes");
    return;
  }
  
  recipes = loadedRecipes;
  displayData(recipes);
  populateDropdowns(recipes);
}

document.addEventListener("DOMContentLoaded", () => {
  init();

  
  const searchForm = document.querySelector('#search-form');
  const searchBarInput = document.querySelector('#search-bar');

  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    activeFilters.search = searchBarInput.value;
    applyFilters();
  });

  let debounceTimeout;
  searchBarInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      activeFilters.search = e.target.value;
      applyFilters();
    }, 300);
  });
});