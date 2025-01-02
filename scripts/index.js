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
  
  const ingredientsList = [];
  for (const ing of recipe.ingredients) {
    const quantity = ing.quantity ? `${ing.quantity} ${ing.unit || ''}` : '';
    ingredientsList.push(`
      <li class="col-6 mb-2" style="display: flex; justify-content: space-between;">
        <strong>${ing.ingredient}</strong>
        <span>${quantity}</span>
      </li>
    `);
  }
  
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
              ${ingredientsList.join('')}
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
  
  const countElement = document.querySelector('#count-recipes');
  if (countElement) {
    countElement.textContent = `Nombre de recettes: ${filteredRecipes.length}`;
  }
  
  if (filteredRecipes.length === 0) {
    recipeSection.innerHTML = '<div class="alert alert-info">Aucune recette trouvée</div>';
    return;
  }

  const startIndex = (currentPage - 1) * recipesPerPage;
  const endIndex = startIndex + recipesPerPage;
  
  const row = document.createElement('div');
  row.className = 'row';

  for (let i = startIndex; i < endIndex && i < filteredRecipes.length; i++) {
    recipeCardGenerator(filteredRecipes[i], row);
  }
  
  recipeSection.appendChild(row);
  createPaginationControls(filteredRecipes);
}

function createPaginationControls(filteredRecipes) {
  let paginationContainer = document.querySelector('#pagination-container');
  if (!paginationContainer) {
    paginationContainer = document.createElement('div');
    paginationContainer.id = 'pagination-container';
    paginationContainer.className = 'text-center mt-3 d-flex justify-content-center align-items-center';
    document.querySelector('#recipe-container').after(paginationContainer);
  }
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

function applyFilters() {
  currentPage = 1;
  let filteredRecipes = [];
  
  for (const recipe of recipes) {
    let includeRecipe = true;
    
    // Filtre de recherche
    if (activeFilters.search) {
      const searchQuery = activeFilters.search.toLowerCase();
      const nameMatch = recipe.name.toLowerCase().includes(searchQuery);
      const descriptionMatch = recipe.description.toLowerCase().includes(searchQuery);
      
      let ingredientMatch = false;
      for (const ing of recipe.ingredients) {
        if (ing.ingredient.toLowerCase().includes(searchQuery)) {
          ingredientMatch = true;
          break;
        }
      }
      
      if (!(nameMatch || descriptionMatch || ingredientMatch)) {
        includeRecipe = false;
      }
    }
    
    // Filtre des ingrédients
    if (includeRecipe && activeFilters.ingredients.size > 0) {
      for (const requiredIngredient of activeFilters.ingredients) {
        let hasIngredient = false;
        for (const ing of recipe.ingredients) {
          if (ing.ingredient === requiredIngredient) {
            hasIngredient = true;
            break;
          }
        }
        if (!hasIngredient) {
          includeRecipe = false;
          break;
        }
      }
    }
    
    // Filtre des appareils
    if (includeRecipe && activeFilters.appliances.size > 0) {
      let hasAppliance = false;
      for (const appliance of activeFilters.appliances) {
        if (recipe.appliance === appliance) {
          hasAppliance = true;
          break;
        }
      }
      if (!hasAppliance) {
        includeRecipe = false;
      }
    }
    
    // Filtre des ustensiles
    if (includeRecipe && activeFilters.ustensils.size > 0) {
      for (const requiredUstensil of activeFilters.ustensils) {
        let hasUstensil = false;
        for (const ustensil of recipe.ustensils) {
          if (ustensil === requiredUstensil) {
            hasUstensil = true;
            break;
          }
        }
        if (!hasUstensil) {
          includeRecipe = false;
          break;
        }
      }
    }
    
    if (includeRecipe) {
      filteredRecipes.push(recipe);
    }
  }
  
  displayData(filteredRecipes);
  updateFilterTags();
}

function updateFilterTags() {
  let filterTagsContainer = document.querySelector('#filter-tags');
  if (!filterTagsContainer) {
    filterTagsContainer = document.createElement('div');
    filterTagsContainer.id = 'filter-tags';
    filterTagsContainer.className = 'mt-3';
    const buttonContainer = document.querySelector('.d-flex.gap-2');
    buttonContainer.after(filterTagsContainer);
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

  for (const ingredient of activeFilters.ingredients) {
    filterTagsContainer.appendChild(createTag(ingredient, 'ingredients'));
  }

  for (const appliance of activeFilters.appliances) {
    filterTagsContainer.appendChild(createTag(appliance, 'appliances'));
  }

  for (const ustensil of activeFilters.ustensils) {
    filterTagsContainer.appendChild(createTag(ustensil, 'ustensils'));
  }
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

  for (const recipe of recipes) {
    for (const ingredient of recipe.ingredients) {
      ingredientsSet.add(ingredient.ingredient);
    }
    if (recipe.appliance) appareilsSet.add(recipe.appliance);
    if (recipe.ustensils) {
      for (const ustensil of recipe.ustensils) {
        ustensilesSet.add(ustensil);
      }
    }
  }

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

  for (const ingredient of ingredientsSet) {
    ingredientsDropdown.appendChild(createDropdownItem(ingredient, 'ingredients'));
  }

  for (const appliance of appareilsSet) {
    appareilsDropdown.appendChild(createDropdownItem(appliance, 'appliances'));
  }

  for (const ustensile of ustensilesSet) {
    ustensilesDropdown.appendChild(createDropdownItem(ustensile, 'ustensils'));
  }

  const dropdowns = [
    { element: ingredientsDropdown, type: 'ingredients' },
    { element: appareilsDropdown, type: 'appliances' },
    { element: ustensilesDropdown, type: 'ustensils' }
  ];

  for (const { element, type } of dropdowns) {
    const resetLi = document.createElement('li');
    const resetButton = document.createElement('button');
    resetButton.className = 'dropdown-item text-primary';
    resetButton.textContent = 'Réinitialiser';
    
    resetButton.addEventListener('click', () => {
      activeFilters[type].clear();
      const items = element.querySelectorAll('.dropdown-item');
      for (const item of items) {
        item.classList.remove('active');
      }
      applyFilters();
    });
    
    resetLi.appendChild(resetButton);
    element.appendChild(resetLi);
  }
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