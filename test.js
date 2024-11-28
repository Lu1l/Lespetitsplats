class RecipeSearch {
    constructor(recipes) {
        this.recipes = recipes;
    }

    searchByName(searchTerm) {
        return this.recipes.filter(recipe => 
            recipe.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }

    searchByIngredient(ingredientName) {
        return this.recipes.filter(recipe => 
            recipe.ingredients.some(ing => 
                ing.ingredient.toLowerCase().includes(ingredientName.toLowerCase())
            )
        );
    }

   
    search(options = {}) {
        const { name, ingredient } = options;
        
        return this.recipes.filter(recipe => {
            const nameMatch = !name || recipe.name.toLowerCase().includes(name.toLowerCase());
            const ingredientMatch = !ingredient || recipe.ingredients.some(ing => 
                ing.ingredient.toLowerCase().includes(ingredient.toLowerCase())
            );
            
            return nameMatch && ingredientMatch;
        });
    }
}


const recipes = [
    {
        "id": 1,
        "name": "Limonade de Coco",
        "ingredients": [
            {"ingredient": "Lait de coco", "quantity": 400, "unit": "ml"},
            {"ingredient": "Jus de citron", "quantity": 2},
            {"ingredient": "Crème de coco", "quantity": 2, "unit": "cuillères à soupe"},
            {"ingredient": "Sucre", "quantity": 30, "unit": "grammes"},
            {"ingredient": "Glaçons"}
        ]
    }
];

const recipeSearch = new RecipeSearch(recipes);

// Ajout d'un écouteur d'événements pour le champ de recherche
document.getElementById('searchBarInput').addEventListener('input', function() {
    const searchTerm = this.value; // Récupère le terme de recherche
    const results = recipeSearch.search({ name: searchTerm }); // Recherche les recettes par nom

    // Met à jour le conteneur des recettes
    const recipeContainer = document.getElementById('recipe-container');
    recipeContainer.innerHTML = ''; // Vide le conteneur avant d'ajouter les résultats

    results.forEach(recipe => {
        const recipeElement = document.createElement('div');
        recipeElement.className = 'col';
        recipeElement.innerHTML = `<div class="card">
            <div class="card-body">
                <h5 class="card-title">${recipe.name}</h5>
                <p class="card-text">${recipe.ingredients.map(ing => ing.ingredient).join(', ')}</p>
            </div>
        </div>`;
        recipeContainer.appendChild(recipeElement); // Ajoute la recette au conteneur
    });
});

// Demonstration
console.log(recipeSearch.searchByName('Coco'));
console.log(recipeSearch.searchByIngredient('Lait'));
console.log(recipeSearch.search({ name: 'Coco', ingredient: 'Lait' }));