/* =====================================================
   BOCA 24/7
   SISTEMA PRINCIPAL
   VERSIÓN CON API AUTOMÁTICA
===================================================== */

const newsGrid = document.getElementById("newsGrid");
const reloadNews = document.getElementById("reloadNews");
const loadMore = document.getElementById("loadMore");
const tickerText = document.getElementById("tickerText");

let todasLasNoticias = [];
let cantidadMostrada = 12;


/* =====================================================
   CONFIGURACIÓN
===================================================== */

const API_NOTICIAS = "/api/noticias";
const ACTUALIZACION_AUTOMATICA = 5 * 60 * 1000;


/* =====================================================
   NOTICIAS DE RESPALDO
===================================================== */

const noticiasRespaldo = [
    {
        titulo: "Boca volvió al triunfo ante Lanús",
        fuente: "BOCA 24/7",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
            "Boca Juniors volvió a ganar en La Bombonera y consiguió tres puntos importantes.",
        link:
            "https://www.bocajuniors.com.ar/noticias"
    },
    {
        titulo: "Comunicado: Juan Barinaga",
        fuente: "Boca Juniors",
        categoria: "Club",
        fecha: "29 de agosto de 2026",
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
   LIMPIAR DESCRIPCIONES DE GOOGLE NEWS
===================================================== */

function limpiarDescripcion(texto) {

    if (!texto) {
        return "";
    }

    const temporal = document.createElement("div");

    temporal.innerHTML = String(texto);

    const limpio = temporal.textContent || temporal.innerText || "";

    return limpio
        .replace(/\s+/g, " ")
        .trim();
}


/* =====================================================
   OBTENER FECHA
===================================================== */

function obtenerFecha(noticia) {

    if (noticia.fecha) {
        const fecha = new Date(noticia.fecha);

        if (!isNaN(fecha.getTime())) {
            return fecha;
        }
    }

    if (noticia.publicado) {
        const fecha = new Date(noticia.publicado);

        if (!isNaN(fecha.getTime())) {
            return fecha;
        }
    }

    return new Date(0);
}


/* =====================================================
   FORMATEAR FECHA
===================================================== */

function formatearFecha(noticia) {

    const fecha = obtenerFecha(noticia);

    if (fecha.getTime() === 0) {
        return noticia.fecha || "";
    }

    return fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =====================================================
   CATEGORÍA AUTOMÁTICA
===================================================== */

function obtenerCategoria(noticia) {

    const texto = (
        (noticia.titulo || "") +
        " " +
        (noticia.contenido || "") +
        " " +
        (noticia.descripcion || "")
    ).toLowerCase();

    if (
        texto.includes("mercado") ||
        texto.includes("refuerzo") ||
        texto.includes("pase") ||
        texto.includes("transferencia") ||
        texto.includes("vendido")
    ) {
        return "Mercado";
    }

    if (
        texto.includes("lesión") ||
        texto.includes("lesionado") ||
        texto.includes("médico")
    ) {
        return "Parte médico";
    }

    if (
        texto.includes("juvenil") ||
        texto.includes("predio") ||
        texto.includes("reserva")
    ) {
        return "Juveniles";
    }

    if (
        texto.includes("camiseta") ||
        texto.includes("club") ||
        texto.includes("comunicado")
    ) {
        return "Club";
    }

    return "Fútbol";
}


/* =====================================================
   IMÁGENES DISPONIBLES
===================================================== */

const imagenesBoca = [
    "/IMG-20260830-WA0002.jpg",
    "/IMG-20260830-WA0004.jpg",
    "/IMG-20260830-WA0006.jpg",
    "/IMG-20260829-WA0001.jpg",
    "/IMG-20260829-WA0003.jpg"
];


/* =====================================================
   CREAR TARJETA
===================================================== */

function crearNoticia(noticia, index) {

    const titulo =
        noticia.titulo ||
        "Última noticia de Boca";

    const fuente =
        noticia.fuente ||
        "BOCA 24/7";

    const descripcionOriginal =
        noticia.contenido ||
        noticia.descripcion ||
        "Toda la información de Boca Juniors.";

    const descripcion =
        limpiarDescripcion(descripcionOriginal);

    const categoria =
        noticia.categoria ||
        obtenerCategoria(noticia);

    const fecha =
        formatearFecha(noticia);

    const link =
        noticia.link ||
        "#";

    const imagen =
        noticia.imagen ||
        imagenesBoca[index % imagenesBoca.length];


    return `
        <article class="news-card">

            <div
                class="news-image"
                style="
                    background-image:
                    linear-gradient(
                        0deg,
                        rgba(0,20,55,.92),
                        rgba(0,20,55,.10)
                    ),
                    url('${escaparHTML(imagen)}');
                "
            >

                <span>
                    ${escaparHTML(categoria).toUpperCase()}
                </span>

            </div>


            <div class="news-content">

                <span class="category">
                    ${escaparHTML(fuente)}
                </span>


                <h3>
                    ${escaparHTML(titulo)}
                </h3>


                <p>
                    ${escaparHTML(
                        descripcion ||
                        "Toda la información de Boca Juniors."
                    )}
                </p>


                <span class="news-date">
                    ${escaparHTML(fecha)}
                </span>


                ${
                    link !== "#"
                    ?
                    `
                    <a
                        href="${escaparHTML(link)}"
                        target="_blank"
                        rel="noopener noreferrer"
                        class="news-read"
                    >
                        LEER MÁS →
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
                        No hay noticias disponibles
                    </h3>

                    <p>
                        Estamos intentando actualizar la información.
                    </p>

                </div>
            </article>
        `;

        return;
    }


    const visibles =
        lista.slice(0, cantidadMostrada);


    newsGrid.innerHTML =
        visibles
            .map((noticia, index) =>
                crearNoticia(noticia, index)
            )
            .join("");


    actualizarBotonVerMas(lista.length);

}


/* =====================================================
   BOTÓN VER MÁS
===================================================== */

function actualizarBotonVerMas(total) {

    if (!loadMore) {
        return;
    }

    if (cantidadMostrada >= total) {

        loadMore.style.display = "none";

    } else {

        loadMore.style.display = "";
        loadMore.textContent = "VER MÁS NOTICIAS";

    }
}


/* =====================================================
   CARGAR NOTICIAS DESDE API
===================================================== */

async function cargarNoticias() {

    if (reloadNews) {

        reloadNews.disabled = true;
        reloadNews.textContent = "ACTUALIZANDO...";
    }


    try {

        const respuesta =
            await fetch(
                API_NOTICIAS +
                "?t=" +
                Date.now(),
                {
                    cache: "no-store"
                }
            );


        if (!respuesta.ok) {

            throw new Error(
                "La API respondió con error " +
                respuesta.status
            );
        }


        const datos =
            await respuesta.json();


        let noticias = [];


        if (Array.isArray(datos)) {

            noticias = datos;

        } else if (
            datos &&
            Array.isArray(datos.noticias)
        ) {

            noticias = datos.noticias;

        }


        if (!noticias.length) {

            throw new Error(
                "La API no devolvió noticias."
            );
        }


        noticias =
            noticias
                .filter(noticia =>
                    noticia &&
                    noticia.titulo
                )
                .sort(
                    (a, b) =>
                        obtenerFecha(b) -
                        obtenerFecha(a)
                );


        todasLasNoticias = noticias;


        cantidadMostrada = 12;


        mostrarNoticias(
            todasLasNoticias
        );


        if (
            tickerText &&
            todasLasNoticias[0]
        ) {

            tickerText.textContent =
                todasLasNoticias[0].titulo;

        }


        console.log(
            "BOCA 24/7:",
            todasLasNoticias.length,
            "noticias cargadas desde la API."
        );


    } catch (error) {

        console.error(
            "Error cargando API:",
            error
        );


        todasLasNoticias =
            noticiasRespaldo;


        cantidadMostrada =
            noticiasRespaldo.length;


        mostrarNoticias(
            noticiasRespaldo
        );


        if (
            tickerText &&
            noticiasRespaldo[0]
        ) {

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
   VER MÁS
===================================================== */

if (loadMore) {

    loadMore.addEventListener(
        "click",
        () => {

            cantidadMostrada += 12;


            mostrarNoticias(
                todasLasNoticias
            );


            if (
                cantidadMostrada >=
                todasLasNoticias.length
            ) {

                loadMore.style.display =
                    "none";

            }

        }
    );

}


/* =====================================================
   BOTÓN ACTUALIZAR
===================================================== */

if (reloadNews) {

    reloadNews.addEventListener(
        "click",
        async () => {

            await cargarNoticias();

        }
    );

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
        </strong>.
        Gracias por participar.
        `;

}


/* =====================================================
   FECHA Y TÍTULO
===================================================== */

function actualizarFecha() {

    const fecha =
        new Date();


    const opciones = {

        day: "numeric",
        month: "long",
        year: "numeric"

    };


    document.title =
        "BOCA 24/7 | " +
        fecha.toLocaleDateString(
            "es-AR",
            opciones
        );

}


/* =====================================================
   ACTUALIZACIÓN AUTOMÁTICA
===================================================== */

setInterval(
    () => {

        console.log(
            "Actualización automática de noticias..."
        );


        cargarNoticias();

    },
    ACTUALIZACION_AUTOMATICA
);


/* =====================================================
   ARRANQUE
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        actualizarFecha();

        cargarNoticias();

    }
);
