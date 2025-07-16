const recipeList = document.getElementById("recipeList");
const searchInput = document.getElementById("searchInput");
const filterCuisine = document.getElementById("filterCuisine");
const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalImage = document.getElementById("modalImage");
const modalDescription = document.getElementById("modalDescription");
const closeModal = document.getElementById("closeModal");

let recipes = [];

function showSkeletons() {
  recipeList.innerHTML = '';
  for (let i = 0; i < 6; i++) {
    const skeleton = document.getElementById("skeleton-template").content.cloneNode(true);
    recipeList.appendChild(skeleton);
  }
}

async function loadRecipes() {
  showSkeletons();
  const res = await fetch("recipes.json");
  recipes = await res.json();
  renderRecipes(recipes);
}

function renderRecipes(data) {
  recipeList.innerHTML = "";
  data.forEach(recipe => {
    const card = document.createElement("div");
    card.className = "card";
    card.setAttribute("draggable", "true");
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}" loading="lazy" />
      <h3>${recipe.title}</h3>
      <button data-id="${recipe.id}">View</button>
    `;
    card.querySelector("button").addEventListener("click", () => showModal(recipe));
    card.addEventListener("dragstart", (e) => {
      e.dataTransfer.setData("text/plain", JSON.stringify(recipe));
    });
    recipeList.appendChild(card);
  });
}

function showModal(recipe) {
  modalTitle.textContent = recipe.title;
  modalImage.src = recipe.image;
  modalImage.alt = recipe.title;
  modalDescription.textContent = recipe.description;
  modal.classList.remove("hidden");

  modalImage.onerror = () => {
    modalImage.src = "images/fallback.jpg";
  };
}

closeModal.onclick = () => modal.classList.add("hidden");

window.onclick = function(event) {
  if (event.target === modal) {
    modal.classList.add("hidden");
  }
};

document.addEventListener("keydown", function(event) {
  if (event.key === "Escape") {
    modal.classList.add("hidden");
  }
});

searchInput.addEventListener("input", () => {
  const keyword = searchInput.value.toLowerCase();
  const filtered = recipes.filter(r => r.title.toLowerCase().includes(keyword));
  renderRecipes(filtered);
});

filterCuisine.addEventListener("change", () => {
  const cuisine = filterCuisine.value;
  const filtered = cuisine ? recipes.filter(r => r.cuisine === cuisine) : recipes;
  renderRecipes(filtered);
});

document.querySelectorAll(".day").forEach(day => {
  day.addEventListener("dragover", e => e.preventDefault());
  day.addEventListener("drop", e => {
    const recipe = JSON.parse(e.dataTransfer.getData("text/plain"));
    const div = document.createElement("div");
    div.textContent = recipe.title;
    div.className = "card";

    // 🔁 Click to remove
    div.addEventListener("click", () => {
      div.remove();
      removeFromPlanner(day.dataset.day, recipe.title);
    });

    day.appendChild(div);
    saveToPlanner(day.dataset.day, recipe.title);
  });
});

function saveToPlanner(day, title) {
  const planner = JSON.parse(localStorage.getItem("mealPlanner") || "{}");
  if (!planner[day]) planner[day] = [];
  planner[day].push(title);
  localStorage.setItem("mealPlanner", JSON.stringify(planner));
}

function removeFromPlanner(day, title) {
  const planner = JSON.parse(localStorage.getItem("mealPlanner") || "{}");
  if (planner[day]) {
    planner[day] = planner[day].filter(item => item !== title);
    localStorage.setItem("mealPlanner", JSON.stringify(planner));
  }
}

function loadPlanner() {
  const planner = JSON.parse(localStorage.getItem("mealPlanner") || "{}");
  document.querySelectorAll(".day").forEach(day => {
    const titles = planner[day.dataset.day] || [];
    titles.forEach(title => {
      const div = document.createElement("div");
      div.textContent = title;
      div.className = "card";
      div.addEventListener("click", () => {
        div.remove();
        removeFromPlanner(day.dataset.day, title);
      });
      day.appendChild(div);
    });
  });
}

loadRecipes();
loadPlanner();
