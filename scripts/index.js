let recipes = [];

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

function displayData(recipes) {
  const recipeSection = document.querySelector('#recipe-container');
  recipeSection.innerHTML = '';
  
  if (recipes.length === 0) {
    recipeSection.innerHTML = '<div class="alert alert-info">Aucune recette trouvée</div>';
    return;
  }

  recipes.forEach(recipe => recipeCardGenerator(recipe, recipeSection));
}

function recipeCardGenerator(recipe, container) {
  const colDiv = document.createElement('div');
  colDiv.className = 'col-md-4 mb-4'; 

  const cardDiv = document.createElement('div');
  cardDiv.className = 'card h-100 shadow-sm';

  const img = document.createElement('img');
  img.src = `assets/${recipe.image}`;
  img.className = 'card-img-top';
  img.alt = recipe.name;
  img.style.height = '200px';
  img.style.objectFit = 'cover';

  const cardBody = document.createElement('div');
  cardBody.className = 'card-body';

  const recipeName = document.createElement('h4');
  recipeName.className = 'recipe-name mb-3';
  recipeName.textContent = recipe.name;

  const description = document.createElement('p');
  description.className = 'card-text mb-3';
  description.textContent = recipe.description;

  const ingredientsTitle = document.createElement('h5');
  ingredientsTitle.className = 'mb-2';
  ingredientsTitle.textContent = 'Ingrédients:';

  const ingredientsList = document.createElement('div');
  ingredientsList.className = 'ingredients-list';

  recipe.ingredients.forEach(ingredient => {
    const ingredientDiv = document.createElement('div');
    ingredientDiv.className = 'ingredient-item d-flex justify-content-between align-items-center mb-2';

    const ingredientName = document.createElement('span');
    ingredientName.className = 'ingredient-name';
    ingredientName.textContent = ingredient.ingredient;

    const quantity = document.createElement('span');
    quantity.className = 'ingredient-quantity text-muted';
    quantity.textContent = `${ingredient.quantity || ''} ${ingredient.unit || ''}`.trim();

    ingredientDiv.appendChild(ingredientName);
    ingredientDiv.appendChild(quantity);
    ingredientsList.appendChild(ingredientDiv);
  });
  

  cardBody.appendChild(recipeName);
  cardBody.appendChild(description);
  cardBody.appendChild(ingredientsTitle);
  cardBody.appendChild(ingredientsList);

  cardDiv.appendChild(img);
  cardDiv.appendChild(cardBody);
  colDiv.appendChild(cardDiv);
  container.appendChild(colDiv);
}

function filterRecipes() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    const selectedCategory = document.getElementById('categoryDropdown').value;

    const filteredRecipes = recipes.filter(recipe => {
        const matchesSearch = recipe.name.toLowerCase().includes(searchQuery);
        const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    displayRecipes(filteredRecipes);
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
    if (recipe.appliance) {
      appareilsSet.add(recipe.appliance);
    }
    if (recipe.ustensils) {
      recipe.ustensils.forEach(ustensil => ustensilesSet.add(ustensil)); // Utiliser un Set pour éviter les doublons
    }
  });


  function createDropdownItem(item, type) {
    const li = document.createElement('li');
    const a = document.createElement('a');
    a.className = 'dropdown-item';
    a.href = '#';
    a.textContent = item;
    a.dataset.type = type;
    a.dataset.value = item;
    
 
    a.addEventListener('click', (e) => {
      e.preventDefault();
      const selectedType = e.target.dataset.type;
      const selectedValue = e.target.dataset.value;
      
      // Filtrer les recettes selon la sélection
      let filteredRecipes;
      
      switch(selectedType) {
        case 'ingredient':
          filteredRecipes = recipes.filter(recipe => 
            recipe.ingredients.some(ing => ing.ingredient === selectedValue)
          );
          break;
        case 'appliance':
          filteredRecipes = recipes.filter(recipe => 
            recipe.appliance === selectedValue
          );
          break;
        case 'ustensil':
          filteredRecipes = recipes.filter(recipe => 
            recipe.ustensils && recipe.ustensils.includes(selectedValue)
          );
          break;
      }
      
    
      displayData(filteredRecipes);
      
  
      document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
      });
      e.target.classList.add('active');
    });
    
    li.appendChild(a);
    return li;
  }

  
  ingredientsSet.forEach(ingredient => {
    ingredientsDropdown.appendChild(createDropdownItem(ingredient, 'ingredient'));
  });

  appareilsSet.forEach(appliance => {
    appareilsDropdown.appendChild(createDropdownItem(appliance, 'appliance'));
  });

  ustensilesSet.forEach(ustensile => {
    ustensilesDropdown.appendChild(createDropdownItem(ustensile, 'ustensil')); // Assurez-vous d'utiliser le Set pour éviter les doublons
  });


  const dropdowns = [
    { element: ingredientsDropdown, type: 'ingredients' },
    { element: appareilsDropdown, type: 'appareils' },
    { element: ustensilesDropdown, type: 'ustensiles' }
  ];

  dropdowns.forEach(({ element, type }) => {
    const resetLi = document.createElement('li');
    const resetButton = document.createElement('button');
    resetButton.className = 'dropdown-item text-primary';
    resetButton.textContent = 'Réinitialiser';
    
    resetButton.addEventListener('click', () => {
      displayData(recipes); // Afficher toutes les recettes
      document.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
      });
    });
    
    resetLi.appendChild(resetButton);
    element.appendChild(resetLi);
  });
}


document.addEventListener("DOMContentLoaded", () => {
  init();

  const searchForm = document.querySelector('#search-form');
  const searchBarInput = document.querySelector('#search-bar');


  searchForm.addEventListener('submit', (e) => {
    e.preventDefault();
    filterRecipes(searchBarInput.value);
  });


  let debounceTimeout;
  searchBarInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      filterRecipes(e.target.value);
    }, 300); 
  });
});