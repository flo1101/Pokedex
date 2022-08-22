const gridBox = document.querySelector("#grid-box");
const alertBox = document.querySelector("#alert-box");
let nationalDex = [];
let displayedItems;

// Initial Page Load
window.addEventListener("load", async () => {
    alertBox.innerHTML = "Loading Pokédex...";
    nationalDex = await getNationalDex();
    await displayPokemon(nationalDex);
    alertBox.style.display = "none";
    alertBox.innerHTML = "";
    displayedItems = nationalDex.slice();
});

async function getNationalDex() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokedex/1");
        const data = await res.json();
        return convertFetchedEntries(data.pokemon_entries);
    } catch (e) {
        console.log("ERROR: ", e);
    }
}

async function convertFetchedEntries(entries) {
    const convertedDex = [];
    for (const entry of entries) {
        const data = await fetchPokemon(entry.entry_number);
        const pokemon = createPokemon(data);
        convertedDex.push(pokemon);
    }
    return convertedDex;
}

function createPokemon(data) {
    const pokemon = {};
    pokemon["id"] = data.id;
    pokemon["name"] = data.name;
    pokemon["sprite"] = data.sprites["front_default"];
    pokemon["types"] = data.types.map(type => type.type.name);
    return pokemon
}


function displayPokemon(pokemon) {
    let html = "";
    for (const mon of pokemon) {
        html += createItemHtml(mon);
    }
    gridBox.innerHTML = html;
}


function createItemHtml(pokemon) {
    const name = firstLetterUppercase(pokemon.name);
    const id = getDisplayableID(pokemon.id);
    const sprite = pokemon.sprite;
    return `<div class="grid-item">
                <div class="item-top">
                    <span class="item-id">${id}</span>
                    <div class="img-box">
                        <img src="${sprite}" alt="${name}" class="item-img">
                    </div>
                    <span class="item-name">${name}</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>`
}

function getDisplayableID(num) {
    let id = "#";
    for(let i = num.toString().length; i < 3; i++) {
        id += "0";
    }
    return id + num;
}

function firstLetterUppercase(str) {
    const words = str.split("-");
    const res = words.map(word => {
        const firstLetter = word[0];
        const rest = word.slice(1);
        return firstLetter.toUpperCase() + rest;
    })
    return res.join("-");
}


// Fetch Pokemon
async function fetchPokemon(input) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/`;
        const res = await fetch(url + input);
        return await res.json();
    } catch (e) {
        console.log("ERROR: ", e);
    }
}


// Search Pokemon
const form = document.querySelector("#search-box");
const input = document.querySelector("#search-input");

form.addEventListener("keyup", searchPokemon)
form.addEventListener("submit", e => {
    e.preventDefault();
    searchPokemon();
});

function searchPokemon() {
    const value = input.value.toLowerCase();
    const filtered = displayedItems
        .filter(pokemon => pokemon.name.includes(value));
    displayPokemon(filtered);
}



// Filter
const activeTypeFilter = [];

const typeFilterBtn = document.querySelector("#type-filter");
let dropdownIsVisible = false;
typeFilterBtn.addEventListener("click", showTypeDropdown);

function showTypeDropdown() {
    const dropdown = document.querySelector("#type-dropdown");
    const arrow = document.querySelector(".filter-arrow");
    if (!dropdownIsVisible) {
        dropdownIsVisible = true;
        dropdown.style.visibility = "visible";
        arrow.classList.remove("ri-arrow-down-s-line");
        arrow.classList.add("ri-arrow-up-s-line");
    } else {
        dropdownIsVisible = false;
        dropdown.style.visibility = "hidden";
        arrow.classList.remove("ri-arrow-up-s-line");
        arrow.classList.add("ri-arrow-down-s-line");
    }
}

const typeItems = document.querySelectorAll(".type-item");
typeItems.forEach(item => item.addEventListener("click", e => {
    const item = e.currentTarget;
    const filterName = item.id;
    const checkbox = item.querySelector(".checkbox");
    if (!activeTypeFilter.includes(filterName)) {
        activeTypeFilter.push(filterName);
        checkbox.style.backgroundColor = "#FC4850";
        checkbox.style.borderColor = "#FC4850"
        applyTypeFilter(filterName);
    } else {
        const index = activeTypeFilter.indexOf(filterName);
        activeTypeFilter.splice(index, 1);
        checkbox.style.backgroundColor = "#ffffff";
        checkbox.style.borderColor = "#a4a4a4"
        removeTypeFilter();
    }
    if (input.value !== "") searchPokemon(input.value.toLowerCase());
}));

async function applyTypeFilter(filterName) {
    const filtered = displayedItems
        .filter(pokemon => pokemon.types.includes(filterName));
    displayPokemon(filtered);
    displayedItems = filtered.slice();
}

async function removeTypeFilter() {
    if (activeTypeFilter.length === 0) {
        displayPokemon(nationalDex);
        displayedItems = nationalDex.slice();
    } else {
        displayedItems = nationalDex.slice();
        activeTypeFilter.forEach(filterName => applyTypeFilter(filterName))
    }
}





