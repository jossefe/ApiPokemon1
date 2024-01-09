
// Elementos del DOM
const navNext = document.getElementById("navegation__next");
const navBack = document.getElementById("navegation__back");
const message = document.getElementsByClassName("text");
const urlPokemons = "https://pokeapi.co/api/v2/pokemon/";
const urlTypePokemons = "https://pokeapi.co/api/v2/type/";
const urlInfoPokemons = "https://pokeapi.co/api/v2/pokemon-species/";
const urlImgPokemonDetail = "https://assets.pokemon.com/assets/cms2/img/pokedex/detail/";
const urlImgPokemonFull = "https://assets.pokemon.com/assets/cms2/img/pokedex/full/";

var currentPage = 1;

// Evento para el botón de página anterior
document.getElementById("prevPage").addEventListener("click", function () {
  if (currentPage > 1) {
    currentPage--;
    updatePagination();
    homePokemon();
  }
});

// Evento para el botón de página siguiente
document.getElementById("nextPage").addEventListener("click", function () {
  currentPage++;
  updatePagination();
  homePokemon();
});

// Evento para el botón de filtrar por tipo
document.getElementById("search__button-type").addEventListener("click", function () {
  searchPokemonType();
});

// Evento para el botón de buscar por nombre o número
document.getElementById("search__button").addEventListener("click", function () {
  searchPokemonNumber();
});

// Función para actualizar la numeración de la página en la interfaz
function updatePagination() {
  document.getElementById("currentPage").textContent = `Página ${currentPage}`;
}

// Función para crear una tarjeta de Pokémon en la interfaz
function card(cardPokemon) {
  let idPokemon = cardPokemon.id;
  let idPokemonModal = cardPokemon.id;
  let tall = cardPokemon.height / 10;
  let weight = cardPokemon.weight / 10;
  let namePokemon = cardPokemon.name;
  let stats = cardPokemon.stats;
  let colorType = cardPokemon.types;
  let typeBack = "";
  let typeIcon = "";
  let valueSelect = document.getElementById("search__select").value;

  if (idPokemon < '10') {
    idPokemon = '00' + idPokemon;
  } else if (idPokemon < '100') {
    idPokemon = '0' + idPokemon;
  }

  if (colorType.length == 1) {
    typeBack += colorType[0].type.name;
  } else {
    typeBack += colorType[1].type.name;
  }

  document.querySelector(".main").insertAdjacentHTML('beforeend',
    `<div class="card col-sm-6 col-md-4 col-xl-3">
      <img src="${urlImgPokemonDetail + idPokemon}.png" class="card__img" alt="${namePokemon}">
      <div class="card__circle"></div>
      <div class="card-body ${typeBack}" id='${valueSelect}'>
        <h5>#${idPokemon}</h5>
        <h1 class="card-title">${namePokemon}</h1>
        <div class="card__type">
          ${typeIcon}
        </div>
        <button type="button" class="btn btn-primary" data-toggle="modal" data-target="#exampleModalCenter${idPokemon}"> Ver Detalles </button>
      </div>
    </div>`
  );
  modalPokemon(idPokemon, typeBack, namePokemon, tall, weight, stats, idPokemonModal, typeIcon);
}

// Función para mostrar un modal con detalles del Pokémon
function modalPokemon(idPokemon, typeBack, namePokemon, tall, weight, stats, idPokemonModal, typeIcon) {
  $.get(urlInfoPokemons + idPokemonModal, (dataPokemon) => {
    let descriptionPokemon = dataPokemon.flavor_text_entries[26].flavor_text;

    // Llama a la función para obtener stats
    getPokemonStats(idPokemonModal, (stats) => {
      $(".main").append(
        `<div class="modal fade" id="exampleModalCenter${idPokemon}" tabindex="-1" role="dialaria-labelledby="exampleModalCenterTitle" aria-hidden="true">
          <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content ${typeBack}">
              <div class="modal-header">
                <h5 class="modal-title" id="exampleModalCenterTitle">#${idPokemon}</h5>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"></button>
              </div>
              <div class="modal-body">
                <div class="row">
                  <div class="modal__info col-12 col-md-6">
                    <h1 class="modal__name">${namePokemon}</h1>
                    <div class="modal__pokemon col-12">
                      <img src="${urlImgPokemonFull + idPokemon}.png" alt="...">
                    </div>
                    <div class="modal__type">
                      ${typeIcon}
                    </div>
                    <div class="modal__features col-12">
                      <p>${tall}m</p>
                      <p>${weight}kg</p>
                    </div>
                    <div class="modal__description col-12">
                      <p>${descriptionPokemon}</p>
                    </div>
                  </div>
                  <div class="modal__graphic col-12 col-md-6">
                    <h1>Stats</h1>
                    <div id="chartContainer${idPokemon}">
                      ${stats.map((stat) => `<p>${stat.name}: ${stat.base_stat}</p>`).join('')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>`
      );
    });
  });
}

// Función principal para cargar la lista de Pokémon en la interfaz
function homePokemon() {
  $(".main").html(""); // Limpiar el contenido actual

  var offset = (currentPage - 1) * 40;
  var url = urlPokemons + `?offset=${offset}&limit=40`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      data.results.forEach(resultPokemon => {
        fetch(resultPokemon.url)
          .then(response => response.json())
          .then(totalPokemon => {
            card(totalPokemon);
          });
      });
    });
}

// Función para buscar un Pokémon por número o nombre
function searchPokemonNumber() {
  let id = $("#idPokemon").val();

  if (id === "") {
    error('Ingrese un número o nombre de pokemon válido');
    return false;
  }
  $(".main").html("");
  let idResult = urlPokemons + id.toLowerCase();

  fetch(idResult)
    .then(response => {
      if (!response.ok) {
        throw new Error('El pokemon que buscas no existe, intentalo de nuevo');
      }
      return response.json();
    })
    .then(idPokemon => {
      card(idPokemon);
      $("#idPokemon").val('');
    })
    .catch(error => {
      error(error.message);
    });
}

// Función para buscar Pokémon por tipo
function searchPokemonType() {
  let typeValue = $("#search__select").val();

  if (typeValue === null) {
    error("Seleccionar un tipo de pokemon");
    return false;
  }

  let urltypeValue = urlTypePokemons + typeValue;
  fetch(urltypeValue)
    .then(response => response.json())
    .then(searchPokemonValue => {
      if (searchPokemonValue.pokemon.length == 0) {
        error("No hay pokemones por ahora");
        return false;
      }
      $(".main").html("");
      searchPokemonValue.pokemon.forEach(searchPokemon => {
        fetch(searchPokemon.pokemon.url)
          .then(response => response.json())
          .then(searchPokemonCard => {
            card(searchPokemonCard);
          });
      });
    });
}

// Función para manejar errores y mostrar mensajes en la interfaz
function error(text) {
  $(".main").html(`
    <div class="alert alert-danger" role="alert">
      <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
      ${text}
    </div>`
  );
}

// Obtener las habilidades de un Pokémon
function getPokemonStats(id, callback) {
  fetch(urlPokemons + id)
    .then(response => response.json())
    .then(data => {
      const stats = data.stats.map(stat => ({ name: stat.stat.name, base_stat: stat.base_stat }));
      callback(stats);
    });
}

// Obtener la lista de tipos de Pokémon y llenar un menú desplegable en la interfaz
fetch(urlTypePokemons)
  .then(response => response.json())
  .then(type => {
    type.results.forEach(typePokemon => {
      $("#search__select").append(`<option class="search__option">${typePokemon.name}</option>`);
    });
  })
  .catch(error => {
    console.error("Error fetching types:", error);
  });

// Inicializa la página de Pokémon al cargar
homePokemon();
