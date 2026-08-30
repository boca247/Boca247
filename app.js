/* =====================================================
   BOCA 24/7
   SISTEMA PRINCIPAL
===================================================== */

const newsGrid = document.getElementById("newsGrid");
const reloadNews = document.getElementById("reloadNews");
const loadMore = document.getElementById("loadMore");
const tickerText = document.getElementById("tickerText");


/* =====================================================
   NOTICIAS DE RESPALDO

   Si noticias.json falla, la web NO queda en blanco.
===================================================== */

const noticiasRespaldo = [

    {
        titulo: "Boca volvió al triunfo ante Lanús",
        fuente: "BOCA 24/7",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
        "Boca Juniors volvió a ganar en La Bombonera. El Xeneize se impuso por 1-0 ante Lanús y consiguió tres puntos importantes en el Torneo Clausura.",
        link:
        "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Estoy en el lugar que amo",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
        "Leandro Paredes y Tomás Belmonte hablaron con la prensa después del triunfo de Boca ante Lanús y analizaron el encuentro.",
        link:
        "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Los tres puntos son importantes",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
        "El plantel Xeneize destacó la importancia de volver a sumar de a tres y continuar trabajando para los próximos compromisos.",
        link:
        "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "Boca presentó su nueva camiseta alternativa",
        fuente: "BOCA 24/7",
        categoria: "Club",
        fecha: "28 de agosto de 2026",
        contenido:
        "La nueva camiseta alternativa de Boca recupera elementos relacionados con los primeros años de la institución y presenta una estética inspirada en la historia del club.",
        link:
        "https://www.bocajuniors.com.ar/"
    },

    {
        titulo: "Comunicado: Juan Barinaga",
        fuente: "Boca Juniors",
        categoria: "Fútbol",
        fecha: "29 de agosto de 2026",
        contenido:
        "Boca publicó información oficial relacionada con Juan Barinaga dentro de las novedades del plantel profesional.",
        link:
        "https://www.bocajuniors.com.ar/noticias"
    },

    {
        titulo: "La Octava en la cima",
        fuente: "Boca Juniors",
        categoria: "Juveniles",
        fecha: "30 de agosto de 2026",
        contenido:
        "Las divisiones juveniles continúan siendo protagonistas y la Octava de Boca se mantiene en la parte alta de su competencia.",
        link:
        "https://www.bocajuniors.com.ar/noticias"
    }

];


/* =====================================================
   ESCAPAR HTML
===================================================== */

function escaparHTML(texto){

    if(texto === undefined || texto === null){
        return "";
    }

    return String(texto)
        .replaceAll("&","&amp;")
        .replaceAll("<","&lt;")
        .replaceAll(">","&gt;")
        .replaceAll('"',"&quot;")
        .replaceAll("'","&#039;");
}


/* =====================================================
   CREAR TARJETA DE NOTICIA
===================================================== */

function crearNoticia(noticia,index){

    const imagenes = [
        "IMG-20260830-WA0003.jpg",
        "IMG-20260830-WA0004.jpg",
        "IMG-20260830-WA0006.jpg"
    ];

    const imagen = imagenes[index % imagenes.length];

    return `

        <article class="news-card">

            <div
                class="news-image"
                style="
                background-image:
                linear-gradient(
                    0deg,
                    rgba(0,20,55,.9),
                    rgba(0,20,55,.1)
                ),
                url('${imagen}');
                "
            >

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

function mostrarNoticias(lista){

    if(!newsGrid){
        return;
    }

    if(!Array.isArray(lista) || lista.length === 0){

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
                        Revisá noticias.json.
                    </p>
                </div>
            </article>
        `;

        return;
    }


    newsGrid.innerHTML =
        lista
        .map((noticia,index) =>
            crearNoticia(noticia,index)
        )
        .join("");

}


/* =====================================================
   CARGAR JSON
===================================================== */

async function cargarNoticias(){

    if(reloadNews){

        reloadNews.disabled = true;
        reloadNews.textContent = "CARGANDO...";
    }

    try{

        const respuesta =
            await fetch(
                "noticias.json?version=" +
                Date.now()
            );


        if(!respuesta.ok){
            throw new Error(
                "No se pudo cargar noticias.json"
            );
        }


        const datos =
            await respuesta.json();


        if(Array.isArray(datos)){

            mostrarNoticias(datos);

            if(datos[0] && tickerText){

                tickerText.textContent =
                    datos[0].titulo;
            }

        }else{

            mostrarNoticias(noticiasRespaldo);

        }

    }catch(error){

        console.warn(
            "Se utilizaron noticias de respaldo:",
            error
        );

        mostrarNoticias(noticiasRespaldo);

        if(tickerText){

            tickerText.textContent =
                noticiasRespaldo[0].titulo;

        }

    }finally{

        if(reloadNews){

            reloadNews.disabled = false;
            reloadNews.textContent = "ACTUALIZAR";

        }

    }

}


/* =====================================================
   ENCUESTA
===================================================== */

function vote(opcion){

    const resultado =
        document.getElementById("pollResult");

    if(!resultado){
        return;
    }

    resultado.innerHTML =
        `Tu voto: <strong>${escaparHTML(opcion)}</strong>. Gracias por participar.`;

}


/* =====================================================
   BOTÓN ACTUALIZAR
===================================================== */

if(reloadNews){

    reloadNews.addEventListener(
        "click",
        cargarNoticias
    );

}


/* =====================================================
   BOTÓN VER MÁS
===================================================== */

if(loadMore){

    loadMore.addEventListener(
        "click",
        () => {

            cargarNoticias();

            loadMore.textContent =
                "NOTICIAS ACTUALIZADAS";

            setTimeout(() => {

                loadMore.textContent =
                    "VER MÁS NOTICIAS";

            },2500);

        }
    );

}


/* =====================================================
   FECHA
===================================================== */

function actualizarFecha(){

    const fecha =
        new Date();

    const opciones = {
        day:"numeric",
        month:"long",
        year:"numeric"
    };

    document.title =
        "BOCA 24/7 | " +
        fecha.toLocaleDateString(
            "es-AR",
            opciones
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
