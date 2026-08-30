// ======================================================
// BOCA 24/7 - APP.JS
// Motor principal de la página
// ======================================================

document.addEventListener("DOMContentLoaded", () => {
  iniciarMenu();
  cargarNoticias();
  iniciarBuscador();
  iniciarEncuesta();
  actualizarFecha();
  iniciarBotonArriba();
});

// ======================================================
// MENÚ / NAVEGACIÓN
// ======================================================

function iniciarMenu() {
  const enlaces = document.querySelectorAll("nav a");

  enlaces.forEach((enlace) => {
    enlace.addEventListener("click", () => {
      enlaces.forEach((item) => item.classList.remove("activo"));
      enlace.classList.add("activo");
    });
  });
}

// ======================================================
// NOTICIAS
// ======================================================

async function cargarNoticias() {
  const contenedor =
    document.getElementById("listaNoticias") ||
    document.querySelector(".grid3");

  if (!contenedor) return;

  try {
    const respuesta = await fetch("noticias.json", {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar noticias.json");
    }

    const noticias = await respuesta.json();

    if (!Array.isArray(noticias) || noticias.length === 0) {
      mostrarEstadoNoticias(contenedor, "No hay noticias disponibles.");
      return;
    }

    contenedor.innerHTML = "";

    noticias.forEach((noticia, indice) => {
      const articulo = crearNoticia(noticia, indice);
      contenedor.appendChild(articulo);
    });

  } catch (error) {
    console.error("Error cargando noticias:", error);

    mostrarEstadoNoticias(
      contenedor,
      "Las noticias no pudieron cargarse en este momento."
    );
  }
}

// ======================================================
// CREAR TARJETA DE NOTICIA
// ======================================================

function crearNoticia(noticia, indice) {
  const articulo = document.createElement("article");

  articulo.className = "card noticia-card";

  const titulo =
    noticia.titulo ||
    noticia.title ||
    "Noticia de Boca";

  const fuente =
    noticia.fuente ||
    noticia.fuente_nombre ||
    noticia.source ||
    "BOCA 24/7";

  const contenido =
    noticia.contenido ||
    noticia.descripcion ||
    noticia.description ||
    "Toda la información de Boca Juniors.";

  const link =
    noticia.link ||
    noticia.url ||
    "#";

  const imagen =
    noticia.imagen ||
    noticia.image ||
    noticia.foto ||
    "";

  const fecha =
    noticia.fecha ||
    noticia.date ||
    "";

  articulo.innerHTML = `
    ${
      imagen
        ? `
          <div class="noticia-imagen">
            <img
              src="${escaparHTML(imagen)}"
              alt="${escaparHTML(titulo)}"
              loading="${indice < 3 ? "eager" : "lazy"}"
              onerror="this.parentElement.classList.add('sin-imagen')"
            >
          </div>
        `
        : ""
    }

    <div class="noticia-contenido">

      <div class="fuente">
        ${escaparHTML(fuente)}
      </div>

      <h3>
        ${escaparHTML(titulo)}
      </h3>

      <p>
        ${escaparHTML(contenido)}
      </p>

      ${
        fecha
          ? `
            <div class="fecha">
              ${escaparHTML(fecha)}
            </div>
          `
          : ""
      }

      ${
        link && link !== "#"
          ? `
            <a
              class="btn"
              href="${escaparHTML(link)}"
              target="_blank"
              rel="noopener noreferrer"
            >
              LEER NOTICIA
            </a>
          `
          : ""
      }

    </div>
  `;

  return articulo;
}

// ======================================================
// ESTADO DE NOTICIAS
// ======================================================

function mostrarEstadoNoticias(contenedor, mensaje) {
  contenedor.innerHTML = `
    <article class="card">
      <div class="fuente">BOCA 24/7</div>
      <h3>${escaparHTML(mensaje)}</h3>
      <p>
        Estamos preparando la información para mostrarla
        nuevamente.
      </p>
    </article>
  `;
}

// ======================================================
// BUSCADOR
// ======================================================

function iniciarBuscador() {
  const buscador =
    document.getElementById("buscadorNoticias");

  const contenedor =
    document.getElementById("listaNoticias") ||
    document.querySelector(".grid3");

  if (!buscador || !contenedor) return;

  buscador.addEventListener("input", () => {
    const texto =
      buscador.value
        .toLowerCase()
        .trim();

    const noticias =
      contenedor.querySelectorAll(".noticia-card");

    noticias.forEach((noticia) => {
      const contenido =
        noticia.textContent.toLowerCase();

      noticia.style.display =
        contenido.includes(texto)
          ? ""
          : "none";
    });
  });
}

// ======================================================
// ENCUESTA
// ======================================================

function iniciarEncuesta() {
  const opciones =
    document.querySelectorAll(".opcion");

  const resultado =
    document.getElementById("resultadoEncuesta");

  if (!opciones.length || !resultado) return;

  opciones.forEach((opcion) => {
    opcion.addEventListener("click", () => {

      opciones.forEach((item) => {
        item.classList.remove("seleccionada");
      });

      opcion.classList.add("seleccionada");

      resultado.innerHTML = `
        Votaste:
        <strong>${escaparHTML(opcion.textContent.trim())}</strong>
        · Gracias por participar.
      `;
    });
  });
}

// ======================================================
// FECHA ACTUAL
// ======================================================

function actualizarFecha() {
  const elemento =
    document.getElementById("fechaHistoria");

  if (!elemento) return;

  const fecha = new Date();

  const meses = [
    "ENERO",
    "FEBRERO",
    "MARZO",
    "ABRIL",
    "MAYO",
    "JUNIO",
    "JULIO",
    "AGOSTO",
    "SEPTIEMBRE",
    "OCTUBRE",
    "NOVIEMBRE",
    "DICIEMBRE"
  ];

  elemento.textContent =
    `${fecha.getDate()} DE ${meses[fecha.getMonth()]}`;
}

// ======================================================
// BOTÓN VOLVER ARRIBA
// ======================================================

function iniciarBotonArriba() {
  const boton =
    document.getElementById("volverArriba");

  if (!boton) return;

  boton.addEventListener("click", () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  });
}

// ======================================================
// ESCAPAR HTML
// ======================================================

function escaparHTML(texto) {
  return String(texto)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// ======================================================
// UTILIDAD GLOBAL
// ======================================================

window.Boca247 = {
  recargarNoticias: cargarNoticias
};
