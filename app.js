const newsGrid = document.getElementById("newsGrid");
const reloadNews = document.getElementById("reloadNews");
const loadMore = document.getElementById("loadMore");
const tickerText = document.getElementById("tickerText");


/* =====================================================
   NOTICIAS ACTUALES DE RESPALDO
===================================================== */

const noticiasRespaldo = [

    {
        titulo: "La Octava en la cima",
        fuente: "Boca Juniors",
        categoria: "Juveniles",
        fecha: "30 de agosto de 2026",
        contenido:
            "La Octava de Boca continúa en la parte alta de su competencia.",
        link:
            "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Comunicado: Juan Barinaga",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
            "Boca publicó información oficial relacionada con Juan Barinaga.",
        link:
            "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Invicto para las mayores",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
            "Las categorías mayores continúan con buenos resultados.",
        link:
            "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Estoy en el lugar que amo",
        fuente: "Boca Juniors",
        categoria: "Entrevistas",
        fecha: "29 de agosto de 2026",
        contenido:
            "Leandro Paredes y Tomás Belmonte hablaron con la prensa tras el triunfo ante Lanús.",
        link:
            "https://www.bocajuniors.com.ar/noticias/estoy-en-el-lugar-que-amo"
    },

    {
        titulo: "Los tres puntos son importantes",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
            "El Vasco Arruabarrena analizó la victoria de Boca frente a Lanús.",
        link:
            "https://www.bocajuniors.com.ar/noticias/los-tres-puntos-son-importantes"
    },

    {
        titulo: "Con el grito final",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
            "Boca le ganó 1-0 a Lanús con un gol de Tomás Belmonte en la última jugada.",
        link:
            "https://www.bocajuniors.com.ar/noticias/con-el-grito-final"
    },

    {
        titulo: "Mantiene el puntaje ideal",
        fuente: "Boca Juniors",
        categoria: "Vóley",
        fecha: "29 de agosto de 2026",
        contenido:
            "Boca superó 3-0 a Gimnasia de La Plata en el Metro de vóley femenino.",
        link:
            "https://www.bocajuniors.com.ar/noticias/mantiene-el-puntaje-ideal"
    },

    {
        titulo: "Comunicado: Gonzalo Gelini",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "28 de agosto de 2026",
        contenido:
            "Información oficial del Club Atlético Boca Juniors.",
        link:
            "https://www.bocajuniors.com.ar/noticias"
    }

];


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparHTML(texto) {

    if (texto === undefined || texto === null) {
        return "";
    }

    return String(texto)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}


/* =====================================================
   CREAR NOTICIA
===================================================== */

function crearNoticia(noticia, index) {

    const fondos = [
        "image-bombonera",
        "image-paredes",
        "image-team"
    ];

    const fondo =
        fondos[index % fondos.length];

    return `

        <article class="news-card">

            <div class="news-image ${fondo}">

                <span>
                    ${escaparHTML(
                        noticia.categoria || "BOCA"
                    ).toUpperCase()}
                </span>

            </div>

            <div class="news-content">

                <span class="category">
                    ${escaparHTML(
                        noticia.fuente || "BOCA 24/7"
                    )}
                </span>

                <h3>
                    ${escaparHTML(
                        noticia.titulo
                    )}
                </h3>

                <p>
                    ${escaparHTML(
                        noticia.contenido ||
                        "Toda la información de Boca Juniors."
                    )}
                </p>

                <span class="news-date">
                    ${escaparHTML(
                        noticia.fecha || ""
                    )}
                </span>

                ${
                    noticia.link
                    ?
                    `
                    <a
                        href="${escaparHTML(noticia.link)}"
                        target="_blank"
                        rel="noopener"
                        class="news-read">

                        LEER NOTICIA →

                    </a>
                    `
                    :
                    ""
                }

            </div>

        </article>

    `;
}


/* =====================================================
   MOSTRAR NOTICIAS
===================================================== */

function mostrarNoticias(lista) {

    if (!newsGrid) {
        return;
    }

    if (!Array.isArray(lista) || lista.length === 0) {

        newsGrid.innerHTML = `
            <article class="news-card">

                <div class="news-content">

                    <span class="category">
                        BOCA 24/7
                    </span>

                    <h3>
                        No hay noticias disponibles.
                    </h3>

                    <p>
                        Intentá actualizar nuevamente.
                    </p>

                </div>

            </article>
        `;

        return;
    }

    newsGrid.innerHTML =
        lista
            .map((noticia, index) =>
                crearNoticia(noticia, index)
            )
            .join("");

}


/* =====================================================
   CARGAR NOTICIAS
===================================================== */

async function cargarNoticias() {

    if (reloadNews) {

        reloadNews.disabled = true;
        reloadNews.textContent = "CARGANDO...";

    }

    try {

        const respuesta =
            await fetch(
                "noticias.json?v=" +
                Date.now()
            );

        if (!respuesta.ok) {
            throw new Error(
                "No se pudo cargar noticias.json"
            );
        }

        const datos =
            await respuesta.json();

        if (
            Array.isArray(datos) &&
            datos.length > 0
        ) {

            mostrarNoticias(datos);

            if (
                datos[0] &&
                tickerText
            ) {

                tickerText.textContent =
                    datos[0].titulo;

            }

        } else {

            mostrarNoticias(
                noticiasRespaldo
            );

        }

    } catch (error) {

        console.warn(
            "Usando noticias de respaldo:",
            error
        );

        mostrarNoticias(
            noticiasRespaldo
        );

        if (tickerText) {

            tickerText.textContent =
                noticiasRespaldo[0].titulo;

        }

    } finally {

        if (reloadNews) {

            reloadNews.disabled = false;
            reloadNews.textContent = "ACTUALIZAR";

        }

    }

}


/* =====================================================
   ENCUESTA
===================================================== */

function vote(opcion) {

    const resultado =
        document.getElementById(
            "pollResult"
        );

    if (!resultado) {
        return;
    }

    resultado.innerHTML =
        `
        Tu voto:
        <strong>
            ${escaparHTML(opcion)}
        </strong>
        · Gracias por participar.
        `;

}


/* =====================================================
   BOTÓN ACTUALIZAR
===================================================== */

if (reloadNews) {

    reloadNews.addEventListener(
        "click",
        cargarNoticias
    );

}


/* =====================================================
   BOTÓN VER MÁS
===================================================== */

if (loadMore) {

    loadMore.addEventListener(
        "click",
        () => {

            mostrarNoticias(
                noticiasRespaldo
            );

            loadMore.textContent =
                "NOTICIAS CARGADAS";

            setTimeout(() => {

                loadMore.textContent =
                    "VER MÁS NOTICIAS";

            }, 2500);

        }
    );

}


/* =====================================================
   FECHA DEL SITIO
===================================================== */

function actualizarFecha() {

    const fecha =
        new Date();

    document.title =
        "BOCA 24/7 | Todo Boca · " +
        fecha.toLocaleDateString(
            "es-AR",
            {
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );

}


/* =====================================================
   ARRANQUE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        cargarNoticias();

        actualizarFecha();

    }
);
