// Variables y constantes
const API = "https://pokeapi.co/api/v2/pokemon?limit=151";
const grid = document.getElementById("grid");
const search = document.getElementById("search");
const btnFavs = document.getElementById("btn-favs");
const btnReset = document.getElementById("btn-reset");
const detailBox = document.getElementById("detail");
const dTitle = document.getElementById("d-title");
const dTypes = document.getElementById("d-types");
const dStats = document.getElementById("d-stats");

// Gestión de favoritos en localStorage
const KEY = "pokedex:favs";
const getFavs = () => new Set(JSON.parse(localStorage.getItem(KEY) || "[]"));
const setFavs = (s) => localStorage.setItem(KEY, JSON.stringify(Array.from(s)));

// Estado de la aplicación
let onlyFavs = false;
// Lista completa de Pokémon cargados
let all = [];

// Funciones auxiliares
function idFromUrl(u) {
  const parts = u.split("/").filter(Boolean);
  return Number(parts[parts.length - 1]);
}

// URL de la imagen oficial del Pokémon
function img(id) {
  return (
    "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/" +
    id +
    ".png"
  );
}

// Capitaliza la primera letra de una cadena
function cap(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Carga los datos iniciales y renderiza
async function load() {
  const res = await fetch(API); // 151 Pokémon
  const data = await res.json(); 
  all = data.results.map((r) => ({
    id: idFromUrl(r.url),
    name: r.name,
    img: img(idFromUrl(r.url)),
  }));
  render();
}

// Renderiza la lista de Pokémon según el estado actual
function render() {

  const term = search.value.trim().toLowerCase();
  const favs = getFavs();
  const items = all.filter((p) => {
    const match = !term || p.name.includes(term) || String(p.id) === term;
    const keep = onlyFavs ? favs.has(p.id) : true;
    return match && keep;
  });

  grid.innerHTML = items
    .map(
      (p) => `
        <div class="card" data-id="${p.id}">
          <img src="${p.img}" alt="${p.name}">
          <div class="card__name">${cap(p.name)}</div>
          <div class="card__meta">#${p.id}</div>
          <button data-action="fav">${
            favs.has(p.id) ? "Quitar ⭐" : "Agregar ⭐"
          }</button>
        </div>
      `
    )
    .join("");
}

// Manejo de eventos delegados
grid.addEventListener("click", async (ev) => {
  const card = ev.target.closest(".card");
  if (!card) return;
  const id = Number(card.dataset.id);

  if (ev.target.matches('[data-action="fav"]')) {
    const favs = getFavs();
    if (favs.has(id)) favs.delete(id);
    else favs.add(id);
    setFavs(favs);
    render();
    return;
  }

  const res = await fetch("https://pokeapi.co/api/v2/pokemon/" + id);
  const p = await res.json();
  dTitle.textContent = cap(p.name) + " (#" + p.id + ")";
  
  dTypes.innerHTML = p.types
    .map((t) => '<span class="chip">' + t.type.name + "</span>")
    .join("");
  dStats.textContent =
    "Altura: " + p.height / 10 + " m • Peso: " + p.weight / 10 + " kg";
  detailBox.style.display = "block";
});

// 
search.addEventListener("input", render);
btnFavs.addEventListener("click", () => {
  onlyFavs = !onlyFavs;
  render();
});

// Resetear filtros
btnReset.addEventListener("click", () => {
  search.value = "";
  onlyFavs = false;
  render();
});

// Carga inicial
load();
