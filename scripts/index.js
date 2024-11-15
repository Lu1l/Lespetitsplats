//import recipes from '.data/recipes.js';
let recipes = []; // À remplir avec les recettes

async function getDataJson() {
  const response = await fetch ('data/recipes.json');
  const data = await response.json()
  return data
}

/*** Afficher les cards ***/
function displayData(recipes) {
  const recipeSection = document.querySelector('.recipe-container'); 
  recipeSection.innerHTML = ''; 
  for (const recipe of recipes) {
   console.log(recipe) //ça c'est ok 
   recipeCardGenerator(recipe, recipeSection)
  }
}

function recipeCardGenerator(recipe, container) {
  const colDiv = document.createElement('div');
            colDiv.className = 'col';

            const cardDiv = document.createElement('div');
            cardDiv.className = 'card h-100';

            const img = document.createElement('img');
            /* img.src = recipe.image; */
            img.src = "https://picsum.photos/200"
            img.className = 'card-img-top';
            img.alt = recipe.title;

            const cardBody = document.createElement('div');
            cardBody.className = 'card-body';

            const title = document.createElement('h5');
            title.className = 'card-title';
            title.textContent = recipe.title;

            const description = document.createElement('p');
            description.className = 'card-text';
            description.textContent = recipe.description;

            const ingredientsTitle = document.createElement('h6');
            ingredientsTitle.className = 'card-title';
            ingredientsTitle.textContent = 'Ingrédients';

            const ingredientsList = document.createElement('ul');
            recipe.ingredients.forEach(ingredient => {
                const listItem = document.createElement('li');
                listItem.textContent = `${ingredient.name}: ${ingredient.quantity}`;
                ingredientsList.appendChild(listItem);
            });

            const cardFooter = document.createElement('div');
            cardFooter.className = 'card-footer';

            const lastUpdated = document.createElement('small');
            lastUpdated.className = 'text-muted';
            lastUpdated.textContent = recipe.lastUpdated;

            // Construire la carte
            cardBody.appendChild(title);
            cardBody.appendChild(description);
            cardBody.appendChild(ingredientsTitle);
            cardBody.appendChild(ingredientsList);
            cardDiv.appendChild(img);
            cardDiv.appendChild(cardBody);
            colDiv.appendChild(cardDiv);
            container.appendChild(colDiv);
}


async function init() {
  recipes = await getDataJson() //toutes les recettes 
  /* Afficher les recipes */ 
  if (!recipes) {
    console.log("recettes non trouvées")
    return
  } else {
    displayData(recipes);
  }
}

document.addEventListener("DOMContentLoaded", async (e) => {
  e.preventDefault()
  await init()
});



// pseudocode 
/* if (searchNanan === "banane") {
  recipes.includes("banane") .filter .map for of 
  displayData(recipes)
} */