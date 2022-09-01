const body = document.querySelector("body");
const main = document.querySelector("main");
const form = document.querySelector("#search-box");
const input = document.querySelector("#search-input");
const settingsBar = document.querySelector("#settings-bar")
const alertBox = document.querySelector("#alert-box");
const gridBox = document.querySelector("#grid-box");
const detailBox = document.querySelector("#detail-box");
const overlayBox = document.querySelector("#overlay-box");

let nationalDex = [];
let specialForms = [];
let displayedItems;


// Initial Page Load
window.addEventListener("load", async () => {
    alertBox.innerHTML = "Loading Pokédex...";
    await fillNationalDex();
    displayPokemon(nationalDex);
    alertBox.style.display = "none";
    displayedItems = nationalDex.slice();
    addDetailPageLinks("item-top");
    addOverlayBackBtnFunction();
    }
);

async function fillNationalDex() {
    try {
        const res = await fetch("https://pokeapi.co/api/v2/pokedex/1");
        const data = await res.json();
        for (const entry of data.pokemon_entries) {
            const pokemonRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${entry.entry_number}`);
            const pokemonData = await pokemonRes.json();
            let pokemon = {
                "id": entry.entry_number,
                "name": entry.pokemon_species.name,
                "pokemonData": pokemonData,
                "speciesData": null
            }
            nationalDex.push(pokemon);
        }
    } catch (e) {
        console.log("ERROR: ", e);
    }
}

function displayPokemon(pokemon) {
    let html = "";
    for (const singlePokemon of pokemon) {
        html += createItemHtml(singlePokemon);
    }
    gridBox.innerHTML = html;
}


function createItemHtml(pokemon) {
    const name = firstLetterUppercase(pokemon.name);
    const id = getDisplayableID(pokemon.id);
    const sprite = pokemon.pokemonData.sprites.front_default;
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

function createEvoItemHtml(pokemon) {
    const name = firstLetterUppercase(pokemon.name);
    const id = getDisplayableID(pokemon.id);
    let spriteURL = pokemon.pokemonData.sprites.front_default;
    spriteURL = spriteURL === null ? "./res/no-img.svg" : spriteURL;
    return `<div class="grid-item evolution-item">
                <div class="item-top">
                    <span class="item-id">${id}</span>
                    <div class="img-box">
                        <img class="item-img" src="${spriteURL}" alt="${name}">
                    </div>
                    <span class="item-name">${name}</span>
                    <div class="item-arrow">
                        <i class="ri-arrow-drop-right-line"></i>
                    </div>
                </div>
                <div class="item-bottom"></div>
            </div>`
}

async function createFormItemHtml(form) {
    const name = firstLetterUppercase(form.name);
    let spriteURL = form.pokemonData.sprites.front_default;
    spriteURL = spriteURL === null ? "./res/no-img.svg" : spriteURL;
    return `<div class="grid-item evolution-item">
                <div class="form-item-top">
                    <div class="img-box">
                        <img class="item-img" src="${spriteURL}" alt="${name}">
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

function addHorizontalScrollability(className) {
    const obj = document.querySelector(`.${className}`);
    obj.addEventListener("wheel", e => {
        if (obj.scrollWidth > obj.clientWidth) {
            e.preventDefault();
            obj.scrollLeft += e.deltaY;
        }
    })
}


// Fetch
async function fetchData(url) {
    try {
        const res = await fetch(url);
        return await res.json();
    } catch (e) {
        console.log("ERROR: ", e);
    }
}



// Search Pokemon

form.addEventListener("keyup", e => {
    if (e.keyCode === 13) return;
    searchPokemon();
    addDetailPageLinks("item-top");
})

form.addEventListener("submit", async e => {
    e.preventDefault();
    const value = input.value.toLowerCase();
    if (!nationalDex.map(pokemon => pokemon.name).includes(value)) return;
    await displayDetailPage(value);
});

function searchPokemon() {
    const value = input.value.toLowerCase();
    filtered = displayedItems
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
        .filter(pokemon => pokemon.pokemonData.types.map(type => type.type.name).includes(filterName));
    displayPokemon(filtered);
    addDetailPageLinks("item-top");
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

function addDetailPageLinks(className) {
    const items = document.querySelectorAll(`.${className}`);
    items.forEach(gridItem => gridItem.addEventListener("click", async e => {
        const pokemonName = e.currentTarget.querySelector(".item-name").textContent.toLowerCase();
        await displayDetailPage(pokemonName);
    }));
}

async function displayDetailPage(pokemonName) {
    if (nationalDex.find(e => e.name === pokemonName).speciesData === null) await addSpeciesData(pokemonName);
    let pokemon = nationalDex.find(e => e.name === pokemonName);
    settingsBar.style.display = "none";
    gridBox.style.display = "none";
    detailBox.innerHTML =
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
                        <div><span class="details-prop-name">Group:</span><br><span class="details-group"></span></div>
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
                    <span class="no-evos-text">This Pokémon doesn't evolve.</span>
                </div>
            </div>
            <h2>Special Forms</h2>
            <div class="grid-details-three">
                <div class="details-panel panel-7">
                    <span class="no-forms-text">This Pokémon has no special forms.</span>
                </div>
            </div>`;

    addValuesDetailPage(pokemon);
    detailBox.style.display = "flex";
    window.scrollTo(0, 0);
    addHorizontalScrollability("panel-6");
    addHorizontalScrollability("panel-7");
    addBackBtnEvent();
}

async function addSpeciesData(pokemonName) {
    try {
        const speciesData = await fetchData(`https://pokeapi.co/api/v2/pokemon-species/${pokemonName}`);
        nationalDex.find(e => e.name === pokemonName)["speciesData"] = speciesData;
    } catch (e) {
        console.log("ERROR: ", e)
    }
}

function addBackBtnEvent() {
    document.querySelector("#details-back-btn").addEventListener("click", () => {
        detailBox.style.display = "none";
        settingsBar.style.display = "flex";
        gridBox.style.display = "grid";
    })
}

async function addValuesDetailPage(pokemon) {
    addNameImgDescID(pokemon);
    addTypes(pokemon);
    addProps(pokemon);
    addStats(pokemon);
    await addAbilityOne(pokemon);
    await addAbilityTwo(pokemon);
    await addEvolutions(pokemon);
    addSpecialForms(pokemon);
}

function addNameImgDescID(pokemon) {
    const id = getDisplayableID(pokemon.id);
    const name = firstLetterUppercase(pokemon.name);
    const img = pokemon.pokemonData.sprites.other["official-artwork"].front_default;
    const description = getFlavorText(pokemon.speciesData);
    setNameImgDescID(name, img, description, id);
}

function addTypes(pokemon) {
    const types = pokemon.pokemonData.types.map(type => type.type.name);
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

function addProps(pokemon) {
    pokemonData = pokemon.pokemonData;
    const heightMtr = pokemonData.height / 10;
    const weightKg = pokemonData.weight / 10;
    let group = "Generic";
    if (pokemon.speciesData.is_legendary === true) {
        group = "Legendary";
    } else if (pokemon.speciesData.is_mythical === true) {
        group = "Mythical";
    }
    setProps(heightMtr, weightKg, group);
}

function addStats(pokemon) {
    pokemonData = pokemon.pokemonData;
    const hp = pokemonData.stats[0].base_stat;
    const att = pokemonData.stats[1].base_stat;
    const def = pokemonData.stats[2].base_stat;
    const spAtt = pokemonData.stats[3].base_stat;
    const spDef = pokemonData.stats[4].base_stat;
    const init = pokemonData.stats[5].base_stat;
    setStats(hp, att, def, spAtt, spDef, init);
}

async function addAbilityOne(pokemon) {
    pokemonData = pokemon.pokemonData;
    const nameOne = firstLetterUppercase(pokemonData.abilities[0].ability.name);
    const urlOne = pokemonData.abilities[0].ability.url;
    const abilityOne = await fetchData(urlOne);
    let textOne;
    try {
        textOne = abilityOne.effect_entries.filter(entry => entry.language.name === "en")[0].short_effect;
    } catch (e) {
        textOne = abilityOne.flavor_text_entries.filter(entry => entry.language.name === "en")[0].flavor_text;
    }
    setAbilityOne(nameOne, textOne);
}

async function addAbilityTwo(pokemon) {
    pokemonData = pokemon.pokemonData;
    if (pokemonData.abilities.length <= 1) return;
    document.querySelector(".abilities-break").style.display = "block";
    const nameTwo = firstLetterUppercase(pokemonData.abilities[1].ability.name);
    const urlTwo = pokemonData.abilities[1].ability.url;
    const abilityTwo = await fetchData(urlTwo);
    const textTwo = abilityTwo.effect_entries.filter(entry => entry.language.name === "en")[0].short_effect;
    setAbilityTwo(nameTwo, textTwo);
}

async function addEvolutions(pokemon) {
    speciesData = pokemon.speciesData;
    const evoData = await fetchData(speciesData.evolution_chain.url)
    const evoChain = getEvoChain(evoData.chain);
    if (evoChain.length === 1 && evoChain[0].evolves_to === undefined) {
        document.querySelector(".no-evos-text").style.display = "block";
        return;
    }
    let html = "";
    document.querySelector(".no-evos-text").style.display = "none";
    html += await getEvoItemHtml(evoChain[0][0]);
    if (evoChain.length > 1) {
        for(let i = 1; i < evoChain.length; i++) {
            html += `<div class="evolution-btn-box">
                        <div class="evo-arrow">
                            <i class="ri-arrow-right-s-line"></i>
                        </div>
                    </div>`;
            for (const pokemonName of evoChain[i]) {
                html += await getEvoItemHtml(pokemonName);
            }
        }
    }
    const evoBox = document.querySelector(".panel-6");
    evoBox.innerHTML = html;
    addDetailPageLinks("item-top");
}

async function addSpecialForms(pokemon) {
    speciesData = pokemon.speciesData;
    if (speciesData.varieties.length === 1) {
        document.querySelector(".no-forms-text").style.display = "block";
        return;
    }
    document.querySelector(".no-forms-text").style.display = "none";
    let html = "";
    const forms = speciesData.varieties.filter(e => e.is_default === false);
    for (const form of forms) {
        const pokemonData = await fetchData(form.pokemon.url)
        let newForm = {
            "name": form.pokemon.name,
            "pokemonData": pokemonData,
            "speciesData": null
        }
        specialForms.push(newForm);
        html += await createFormItemHtml(newForm)
    }
    document.querySelector(".panel-7").innerHTML = html;
    addFormPageLinks("form-item-top");
}

async function addFormPageLinks(className) {
    const items = document.querySelectorAll(`.${className}`);
    items.forEach(gridItem => gridItem.addEventListener("click", async e => {
        const pokemonName = e.currentTarget.querySelector(".item-name").textContent.toLowerCase();
        const pokemon = specialForms.find(form => form.name === pokemonName);
        const name = firstLetterUppercase(pokemon.name);
        let imgURL = pokemon.pokemonData.sprites.other["official-artwork"].front_default;
        imgURL = imgURL === null ? "./res/no-img.svg" : imgURL;
        document.querySelector(".overlay-title").textContent = name;
        const img = document.querySelector(".overlay-img");
        img.setAttribute("src", imgURL);
        img.setAttribute("alt", name);
        overlayBox.style.display = "flex";
    }));
}

function addOverlayBackBtnFunction() {
    document.querySelector(".overlay-back-btn").addEventListener("click", () => {
        overlayBox.style.display = "none";
    })
}


function getEvoChain(evoData) {
    let evoChain = [];
    do {
        let numberOfEvolutions = evoData.evolves_to.length;
        evoChain.push([evoData.species.name]);
        if (numberOfEvolutions > 1) {
            let currEvos = [];
            evoData.evolves_to.forEach(evo => currEvos.push(evo.species.name));
            evoChain.push(currEvos);
            evoData = evoData.evolves_to[0];
        }
        evoData = evoData.evolves_to[0];
    } while(evoData !== undefined && evoData.hasOwnProperty("evolves_to"));
    return evoChain;
}

async function getEvoItemHtml(pokemonName) {
    let pokemon = nationalDex.find(e => e.name === pokemonName);
    return createEvoItemHtml(pokemon);
}

function getFlavorText(speciesData) {
    let text = speciesData.flavor_text_entries.filter(entry => entry.language.name === "en")[0].flavor_text;
    return text.replaceAll("\n"," ").replaceAll("\f", " ");
}

function setNameImgDescID(name, img, description, id) {
    document.querySelector(".details-name").innerHTML = name;
    document.querySelector(".details-flavor-text").innerHTML = description;
    document.querySelector(".details-img").setAttribute("src", img);
    document.querySelector(".details-img").setAttribute("alt", name);
    document.querySelector(".details-id").innerHTML = id;
}

function setProps(height, weight, group) {
    document.querySelector(".details-height").innerHTML = height + " m";
    document.querySelector(".details-weight").innerHTML = weight + " kg";
    document.querySelector(".details-group").innerHTML = group;
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

function setAbilityOne(name1, text1) {
    document.querySelector(".ability-one-name").textContent = name1;
    document.querySelector(".ability-one-text").textContent = text1;
}

function setAbilityTwo(name2, text2) {
    document.querySelector(".ability-two-name").textContent = name2;
    document.querySelector(".ability-two-text").textContent = text2;
}