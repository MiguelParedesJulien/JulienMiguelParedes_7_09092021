import { recipes } from "./recipes.js";

console.log("recipes");

// Input de recherche principale

const input = document.querySelector(".search__input");

// Injection des recettes dans le HTML

recipes.forEach((recipe) => {
   const recipeList = document.querySelector(".recipes");

   const recipeSample = document.createElement("article");
   recipeSample.setAttribute("class", "recipes__sample");
   recipeSample.classList.add("class", "entrees");
   recipeSample.setAttribute("id", recipe.id);

   const recipeSampleHead = document.createElement("div");
   recipeSampleHead.setAttribute("class", "recipes__sample__head");

   const recipeSampleFoot = document.createElement("div");
   recipeSampleFoot.setAttribute("class", "recipes__sample__foot");

   const recipeSampleTitle = document.createElement("div");
   recipeSampleTitle.setAttribute("class", "recipes__sample__foot-title");

   const recipeSampleDetails = document.createElement("div");
   recipeSampleDetails.setAttribute("class", "recipes__sample__foot-details");

   const title = document.createElement("h2");
   title.innerText = recipe.name;
   title.setAttribute("tabindex", "0");

   const time = document.createElement("p");
   time.setAttribute("class", "time");
   time.innerHTML = `<i class="far fa-clock"></i><span>${recipe.time} min</span>`;
   time.setAttribute("tabindex", "0");
   // time.setAttribute("aria-label", `Temps de préparation ${recipe.time} minutes`);

   const instruction = document.createElement("p");
   instruction.setAttribute("class", "instruction");
   instruction.setAttribute("tabindex", "0");
   instruction.innerHTML = recipe.description;

   const ingredientAndQuantity = document.createElement("div");
   ingredientAndQuantity.setAttribute("class", "ingredientAndQuantity");
   const details = document.createElement("ul");
   details.setAttribute("class", "details");

   recipe.ingredients.forEach((aliment) => {
      const ingredient = document.createElement("li");
      ingredient.setAttribute("class", "ingredient");
      ingredient.setAttribute("tabindex", "0");
      // ingredient.setAttribute("aria-label", aliment.ingredient);
      const quantity = document.createElement("span");
      quantity.setAttribute("class", "quantity");
      // quantity.setAttribute("tabindex", "0");
      // quantity.setAttribute("aria-label", aliment.quantity);
      // const unit = document.createElement("p");
      // unit.setAttribute("class", "unit");
      // unit.setAttribute("tabindex", "0");
      // quantity.setAttribute("aria-label", `${aliment.quantity} ${aliment.unit}`);

      ingredient.innerHTML = aliment.ingredient;
      // unit.innerText = aliment.unit;

      if (aliment.quantity === undefined) {
         aliment.quantity = "";
      }
      if (aliment.unit === undefined) {
         aliment.unit = "";
      }
      quantity.innerHTML = `${aliment.quantity} ${aliment.unit}`;
      // if (aliment.unit === "grammes" || aliment.unit === "gramme") {
      //     aliment.unit = "gr";
      // }
      ingredient.appendChild(quantity);
      details.appendChild(ingredient);
      // details.appendChild(unit);
      ingredientAndQuantity.appendChild(details);
   });

   recipeSampleTitle.appendChild(title);
   recipeSampleTitle.appendChild(time);

   recipeSampleDetails.appendChild(ingredientAndQuantity);
   recipeSampleDetails.appendChild(instruction);

   recipeSampleFoot.appendChild(recipeSampleTitle);
   recipeSampleFoot.appendChild(recipeSampleDetails);

   recipeSample.appendChild(recipeSampleHead);
   recipeSample.appendChild(recipeSampleFoot);

   recipeList.appendChild(recipeSample);
});

const ingredientsList = document.querySelector(".filters__ingredients__list");
const appliancesList = document.querySelector(".filters__appareil__list");
const ustensilsList = document.querySelector(".filters__ustensiles__list");
const filtersIngredientsDiv = document.querySelector(".filters__ingredients");

// Tableaux pour stocker différents tags ingrédients appareils et ustensiles
let ingTags = [];
let appTags = [];
let ustTags = [];

// Affichage des recettes selon la saisie dans l'input de recherche

input.addEventListener("input", recipeFilterByInput);
// Selection de toutes les recettes présentes dans le html
const recipeSamples = document.querySelectorAll(".recipes__sample");

let filteredRecipes = [];

function getInputSearchResults() {
   return recipes.filter((obj) => {
      if (input.value.length > 2) {
         // Si la valeur saisie dans l'input existe dans le titre, la description ou un ingredient de la recette, la recette reste apparente, sinon elle disparaît
         if (
            obj.name.toLowerCase().includes(input.value.toLowerCase()) ||
            obj.description.toLowerCase().includes(input.value.toLowerCase()) ||
            obj.ingredients
               .map((ing) => ing.ingredient.toLowerCase())
               .join(" ")
               .includes(input.value.toLowerCase())
         ) {
            return true;
         }
         return false;
      }
      return true;
   });
}

function getTagsSearchResults() {
   return recipes.filter((obj) => {
      let testIng = true;
      let testApp = true;
      let testUst = true;

      let compteurIng = 0;
      let compteurUst = 0;

      if (ingTags.length > 0) {
         ingTags.forEach((ingTag) => {
            for (let i = 0; i < obj.ingredients.length; i++) {
               if (obj.ingredients[i].ingredient.toLowerCase().includes(ingTag)) {
                  compteurIng++;
                  // console.log(compteurIng);
               }
               if (compteurIng === ingTags.length) {
                  testIng = true;
               } else {
                  testIng = false;
               }
            }
         });
      }

      if (appTags.length > 0) {
         // Tableau de tags appareils contient l'appareil de la recette
         testApp = appTags.includes(obj.appliance.toLowerCase());
      }

      if (ustTags.length > 0) {
         ustTags.forEach((ustTag) => {
            for (let i = 0; i < obj.ustensils.length; i++) {
               if (obj.ustensils[i].toLowerCase().includes(ustTag)) {
                  compteurUst++;
                  // console.log(compteurIng);
               }
               if (compteurUst == ustTags.length) {
                  testUst = true;
               } else {
                  testUst = false;
               }
            }
         });
      }
      // console.log(compteurIng);

      return testIng && testApp && testUst;
   });
}

function recipeFilterByInput() {
   refreshSearch();
}

function isInSearchResult(recipeId) {
   recipeId = parseInt(recipeId, 10);

   const filterIds = filteredRecipes.map((obj) => obj.id);

   if (filterIds.includes(recipeId)) {
      return true;
   }
   return false;
}

function refreshSearch() {
   filteredRecipes = recipes.filter((recipe) => {
      if (
         getInputSearchResults()
            .map((obj) => obj.id)
            .includes(recipe.id) &&
         getTagsSearchResults()
            .map((obj) => obj.id)
            .includes(recipe.id)
      ) {
         return true;
      }
      return false;
   });

   Array.from(recipeSamples).forEach((recipeSample) => {
      recipeSample.style.display = isInSearchResult(recipeSample.getAttribute("id")) ? "flex" : "none";
   });

   filterIngredients();
   filterAppliances();
   filterUstensils();

   const errorMsg = document.querySelector(".error");

   function error() {
      if (Array.from(filteredRecipes).length < 1) {
         errorMsg.style.display = "flex";
      } else {
         errorMsg.style.display = "none";
      }
   }

   error();
}
