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

function filterRecipes(searchTerm) {
  if (!searchTerm.trim()) {
    displayData(recipes);
    return;
  }

  const searchTerms = searchTerm.toLowerCase().split(' ').filter(term => term.length > 0);
  
  const filteredRecipes = recipes.filter(recipe => {
  
    const nameMatch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Recherche dans les ingrédients
    const ingredientMatch = recipe.ingredients.some(ingredient =>
      searchTerms.some(term => 
        ingredient.ingredient.toLowerCase().includes(term)
      )
    );
    
   
    const descriptionMatch = recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    return nameMatch || ingredientMatch || descriptionMatch;
  });

  displayData(filteredRecipes);
}

async function init() {
  const loadedRecipes = await getDataJson();
  if (!loadedRecipes) {
    console.error("Impossible de charger les recettes");
    return;
  }
  
  recipes = loadedRecipes;
  displayData(recipes);
}

// Gestionnaires d'événements
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