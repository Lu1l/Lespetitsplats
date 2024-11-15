//import recipes from './recipes.js';

        const recipeContainer = document.querySelector('.recipe-container');

        recipes.forEach(recipe => {
            // Créer la carte
            const colDiv = document.createElement('div');
            colDiv.className = 'col';

            const cardDiv = document.createElement('div');
            cardDiv.className = 'card h-100';

            const img = document.createElement('img');
            img.src = recipe.image;
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
            recipeContainer.appendChild(colDiv);
            return recipeContainer;
        });


