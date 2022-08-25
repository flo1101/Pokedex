const gridBox = document.querySelector("#grid-box");
const alertBox = document.querySelector("#alert-box");
const main = document.querySelector("main");
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
    addDetailPageClickEvents();
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
async function fetchData(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.log("ERROR: ", e);
    }
}

async function fetchPokemon(input) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon/`;
        const res = await fetch(url + input);
        return await res.json();
    } catch (e) {
        console.log("ERROR: ", e);
    }
}

async function fetchSpecies(input) {
    try {
        const url = `https://pokeapi.co/api/v2/pokemon-species/`;
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
form.addEventListener("submit", async e => {
    e.preventDefault();
    const value = input.value.toLowerCase();
    if (!nationalDex.map(pokemon => pokemon.name).includes(value)) return;
    await displayDetailPage(value);

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

// Detail Pages

function addDetailPageClickEvents() {
    const gridItems = document.querySelectorAll(".item-top");
    gridItems.forEach(gridItem => gridItem.addEventListener("click", async e => {
        const pokemon = e.currentTarget.querySelector(".item-name").textContent.toLowerCase();
        await displayDetailPage(pokemon);
    }));
}

async function displayDetailPage(pokemon) {
    const pokemonData = await fetchPokemon(pokemon);
    const speciesData = await fetchSpecies(pokemon);
    main.innerHTML =
           `<div class="grid-details-one">
                <div class="arrow-btn" id="details-back-btn">
                    <i class="ri-arrow-left-s-line"></i>
                </div>
                <div class="details-panel panel-1">
                    <div class="details-img-box">
                        <img class="details-img" src="" alt="">
                    </div>
                    <img class="circle-bg" src="./res/circles-bg.svg">
                </div>
                <div class="panel-2">
                    <div>
                        <span class="details-id"></span>
                        <h2 class="details-name"></h2>
                    </div>
                    <p class="details-flavor-text"></p>
                </div>
                <div class="details-panel panel-3">
                    <div class="details-types"></div>
                    <div class="details-props">
                        <div><span class="details-prop-name">Height:</span><br><span class="details-height"></span></div>
                        <div><span class="details-prop-name">Weight:</span><br><span class="details-weight"></span></div>
                        <div><span class="details-prop-name">Gender:</span><br><span class="details-gender"></span></div>
                    </div>
                </div>
                <div class="details-panel panel-4">
                    <div class="stats-grid-item stat-hp">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-hp-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-hp"></span>
                        </div>
                        <span class="stat-name">HP</span>
                    </div>
                    <div class="stats-grid-item stat-attack">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-att-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-att"></span>
                        </div>
                        <span class="stat-name">Attack</span>
                    </div>
                    <div class="stats-grid-item stat-defense">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-def-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-def"></span>
                        </div>
                        <span class="stat-name">Defense</span>
                    </div>
                    <div class="stats-grid-item stat-sp-attack">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-sp-att-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-sp-att"></span>
                        </div>
                        <span class="stat-name">Sp-Attack</span>
                    </div>
                    <div class="stats-grid-item stat-sp-defense">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-sp-def-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-sp-def"></span>
                        </div>
                        <span class="stat-name">Sp-Defense</span>
                    </div>
                    <div class="stats-grid-item stat-init">
                        <div class="animation-box">
                            <svg class="stats-loaded-circle">
                                <circle class="details-init-circle" cx="50%" cy="50%" r="50%"/>
                            </svg>
                            <div class="stats-bg-circle"></div>
                            <span class="stat-value details-init"></span>
                        </div>
                        <span class="stat-name">Initiative</span>
                    </div>
                </div>
            </div>
            <h2>Abilities & Evolutions</h2>
            <div class="grid-details-two">
                <div class="details-panel panel-5">
                    <div class="abilities-content">
                        <div class="ability-one">
                            <span class="ability-one-name"></span>
                            <p class="ability-one-text"></p>
                        </div>
                        <div class="abilities-break"></div>
                        <div class="ability-two">
                            <span class="ability-two-name"></span>
                            <p class="ability-two-text"></p>
                        </div>
                    </div>
                    <div class="bg-shape-abilities"></div>
                    <img src="./res/circles-bg-2.svg">
                </div>
                <div class="details-panel panel-6">
                    <div class="grid-item evolution-item">
                        <div class="item-top">
                            <span class="item-id">#001</span>
                            <div class="img-box">
                                <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                            </div>
                            <span class="item-name">Lugia</span>
                            <div class="item-arrow">
                                <i class="ri-arrow-drop-right-line"></i>
                            </div>
                        </div>
                        <div class="item-bottom"></div>
                    </div>
                    <div class="evolution-btn-box">
                        <div class="arrow-btn">
                            <i class="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                    <div class="grid-item evolution-item">
                        <div class="item-top">
                            <span class="item-id">#001</span>
                            <div class="img-box">
                                <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                            </div>
                            <span class="item-name">Lugia</span>
                            <div class="item-arrow">
                                <i class="ri-arrow-drop-right-line"></i>
                            </div>
                        </div>
                        <div class="item-bottom"></div>
                    </div>
                    <div class="evolution-btn-box">
                        <div class="arrow-btn">
                            <i class="ri-arrow-right-s-line"></i>
                        </div>
                    </div>
                    <div class="grid-item evolution-item">
                        <div class="item-top">
                            <span class="item-id">#001</span>
                            <div class="img-box">
                                <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                            </div>
                            <span class="item-name">Lugia</span>
                            <div class="item-arrow">
                                <i class="ri-arrow-drop-right-line"></i>
                            </div>
                        </div>
                        <div class="item-bottom"></div>
                    </div>
                </div>
            </div>
            <h2>Special Forms</h2>
            <div class="grid-details-two">
                <div class="details-panel panel-7">
                    <div class="grid-item evolution-item">
                        <div class="item-top">
                            <span class="item-id">#001</span>
                            <div class="img-box">
                                <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                            </div>
                            <span class="item-name">Lugia</span>
                            <div class="item-arrow">
                                <i class="ri-arrow-drop-right-line"></i>
                            </div>
                        </div>
                        <div class="item-bottom"></div>
                    </div>
                    <div class="grid-item evolution-item">
                        <div class="item-top">
                            <span class="item-id">#001</span>
                            <div class="img-box">
                                <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                            </div>
                            <span class="item-name">Lugia</span>
                            <div class="item-arrow">
                                <i class="ri-arrow-drop-right-line"></i>
                            </div>
                        </div>
                        <div class="item-bottom"></div>
                    </div>
                </div>
            </div>`;
    addValuesDetailPage(pokemonData, speciesData);
}

async function addValuesDetailPage(pokemonData, speciesData) {
    const id = getDisplayableID(pokemonData.id);
    const name = firstLetterUppercase(pokemonData.name);
    const img = pokemonData.sprites.other["official-artwork"].front_default;
    const description = getFlavorText(speciesData);
    setNameImgDescID(name, img, description, id);

    const types = pokemonData.types.map(type => type.type.name);
    setTypes(types);

    const heightMtr = pokemonData.height / 10;
    const weightKg = pokemonData.weight / 10;
    const gender = "";
    setProps(heightMtr, weightKg, gender);

    const hp = pokemonData.stats[0].base_stat;
    const att = pokemonData.stats[1].base_stat;
    const def = pokemonData.stats[2].base_stat;
    const spAtt = pokemonData.stats[3].base_stat;
    const spDef = pokemonData.stats[4].base_stat;
    const init = pokemonData.stats[5].base_stat;
    setStats(hp, att, def, spAtt, spDef, init);

    const nameOne = firstLetterUppercase(pokemonData.abilities[0].ability.name);
    const urlOne = pokemonData.abilities[0].ability.url;
    const abilityOne = await fetchData(urlOne);
    const textOne = abilityOne.effect_entries.filter(entry => entry.language.name === "en")[0].short_effect;
    const nameTwo = firstLetterUppercase(pokemonData.abilities[1].ability.name);
    const urlTwo = pokemonData.abilities[1].ability.url;
    const abilityTwo = await fetchData(urlTwo);
    const textTwo = abilityTwo.effect_entries.filter(entry => entry.language.name === "en")[0].short_effect;
    setAbilities(nameOne, textOne, nameTwo, textTwo);
}

function getFlavorText(speciesData) {
    let text = speciesData.flavor_text_entries[0].flavor_text;
    return text.replaceAll("\n"," ").replaceAll("\f", " ");
}

function setNameImgDescID(name, img, description, id) {
    document.querySelector(".details-name").innerHTML = name;
    document.querySelector(".details-flavor-text").innerHTML = description;
    document.querySelector(".details-img").setAttribute("src", img);
    document.querySelector(".details-img").setAttribute("alt", name);
    document.querySelector(".details-id").innerHTML = id;
}

function setTypes(types) {
    const detailsTypes = document.querySelector(".details-types");
    types.forEach(type => {
        const iconPath = `./res/type-icons/${type}.svg`
        const typeName = firstLetterUppercase(type);
        const typeDiv = document.createElement("div");
        typeDiv.classList.add("detail-type");
        typeDiv.style.background = `var(--bg-${type})`;
        typeDiv.innerHTML = `<div class="detail-type-img">
                                <img src="${iconPath}" alt="${typeName}">
                        </div>
                        ${typeName}`
        detailsTypes.appendChild(typeDiv);
    });
}

function setProps(height, weight, gender) {
    document.querySelector(".details-height").innerHTML = height + " m";
    document.querySelector(".details-weight").innerHTML = weight + " kg";
    document.querySelector(".details-gender").innerHTML = gender;
}

function setStats(hp, att, def, spAtt, spDef, init) {
    document.querySelector(".details-hp").innerHTML = hp;
    document.querySelector(".details-att").innerHTML = att;
    document.querySelector(".details-def").innerHTML = def;
    document.querySelector(".details-sp-att").innerHTML = spAtt;
    document.querySelector(".details-sp-def").innerHTML = spDef;
    document.querySelector(".details-init").innerHTML = init;
    document.querySelector(".details-hp-circle").style.strokeDashoffset = 301 - hp;
    document.querySelector(".details-att-circle").style.strokeDashoffset = 301 - att;
    document.querySelector(".details-def-circle").style.strokeDashoffset = 301 - def;
    document.querySelector(".details-sp-att-circle").style.strokeDashoffset = 301 - spAtt;
    document.querySelector(".details-sp-def-circle").style.strokeDashoffset = 301 - spDef;
    document.querySelector(".details-init-circle").style.strokeDashoffset = 301 - init;
}

function setAbilities(name1, text1, name2, text2) {
    document.querySelector(".ability-one-name").textContent = name1;
    document.querySelector(".ability-one-text").textContent = text1;
    document.querySelector(".ability-two-name").textContent = name2;
    document.querySelector(".ability-two-text").textContent = text2;
}

/*
    <div class="grid-details-one">
        <div class="arrow-btn" id="details-back-btn">
            <i class="ri-arrow-left-s-line"></i>
        </div>
        <div class="details-panel panel-1">
            <div class="details-img-box">
                <img src="./res/249.png" alt="">
            </div>
            <img class="circle-bg" src="./res/circles-bg.svg">
        </div>
        <div class="panel-2">
            <div>
                <span>#249</span>
                <h2>Lugia</h2>
            </div>
            <p>It is said that it quitely spends its time deep at the bottom of the sea because its powers are too strong.</p>
        </div>
        <div class="details-panel panel-3">
            <div>
                <div class="detail-type">
                    <div class="detail-type-img">
                        <img src="./res/type-icons/psychic.svg" alt="psychic">
                    </div>
                    Psychic
                </div>
                <div class="detail-type">
                    <div class="detail-type-img">
                        <img src="./res/type-icons/flying.svg" alt="psychic">
                    </div>
                    Flying
                </div>
            </div>
            <div class="details-props">
                <div><span>Height:</span><br>5.2 m</div>
                <div><span>Weight:</span><br>216 kg</div>
                <div><span>Gender:</span><br>unknown</div>
            </div>
        </div>
        <div class="details-panel panel-4">
            <div class="stats-grid-item stat-hp">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    HP
                </span>
            </div>
            <div class="stats-grid-item stat-attack">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    Attack
                </span>
            </div>
            <div class="stats-grid-item stat-defense">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    Attack
                </span>
            </div>
            <div class="stats-grid-item stat-sp-attack">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    Sp-Attack
                </span>
            </div>
            <div class="stats-grid-item stat-sp-defense">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    Sp-Defense
                </span>
            </div>
            <div class="stats-grid-item stat-init">
                <div class="animation-box">
                    <svg class="stats-loaded-circle">
                        <circle cx="50%" cy="50%" r="50%"/>
                    </svg>
                    <div class="stats-bg-circle"></div>
                    <span class="stat-value">80</span>
                </div>
                <span class="stat-name">
                    Initiative
                </span>
            </div>
        </div>
    </div>
    <h2>Abilities & Evolutions</h2>
    <div class="grid-details-two">
        <div class="details-panel panel-5">
            <div class="abilities-content">
                <div class="ability-one">
                    <span>Pressure</span>
                    <p>Increases the PP cost of moves targetting the Pokémon by one.</p>
                </div>
                <div class="abilities-break"></div>
                <div class="ability-two">
                    <span>Multiscale (hidden)</span>
                    <p>This Pokémon takes half as much damage when it is hit having full HP.</p>
                </div>
            </div>
            <div class="bg-shape-abilities"></div>
            <img src="./res/circles-bg-2.svg">
        </div>
        <div class="details-panel panel-6">
            <div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">#001</span>
                    <div class="img-box">
                        <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                    </div>
                    <span class="item-name">Lugia</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>
            <div class="evolution-btn-box">
                <div class="arrow-btn">
                    <i class="ri-arrow-right-s-line"></i>
                </div>
            </div>
            <div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">#001</span>
                    <div class="img-box">
                        <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                    </div>
                    <span class="item-name">Lugia</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>
            <div class="evolution-btn-box">
                <div class="arrow-btn">
                    <i class="ri-arrow-right-s-line"></i>
                </div>
            </div>
            <div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">#001</span>
                    <div class="img-box">
                        <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                    </div>
                    <span class="item-name">Lugia</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>
        </div>
    </div>
    <h2>Special Forms</h2>
    <div class="grid-details-two">
        <div class="details-panel panel-7">
            <div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">#001</span>
                    <div class="img-box">
                        <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                    </div>
                    <span class="item-name">Lugia</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>
            <div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">#001</span>
                    <div class="img-box">
                        <img src="./res/249-sprite.png" alt="Lugia" class="item-img">
                    </div>
                    <span class="item-name">Lugia</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>
        </div>
    </div>
*/




