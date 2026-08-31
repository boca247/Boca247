/* =========================================================
   BOCA 24/7 - APP.JS
   Sistema principal
   Noticias + partidos + tabla + agenda + mercado +
   obras + videos + disciplinas + historia + galería +
   encuesta + ticker
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {

    /* =====================================================
       CONFIGURACIÓN
       ===================================================== */

    const ARCHIVOS = {
        noticias: "noticias.json",
        partidos: "partidos.json",
        tabla: "tabla.json",
        agenda: "agenda.json",
        mercado: "mercado.json",
        obras: "obras.json",
        videos: "videos.json",
        disciplinas: "disciplinas.json",
        historia: "historia.json",
        galeria: "galeria.json"
    };


    /* =====================================================
       FUNCIONES GENERALES
       ===================================================== */

    async function cargarJSON(archivo) {

        try {

            const respuesta = await fetch(
                `${archivo}?v=${Date.now()}`,
                {
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    `No se pudo cargar ${archivo}`
                );
            }

            return await respuesta.json();

        } catch (error) {

            console.error(
                `BOCA 24/7 - Error cargando ${archivo}:`,
                error
            );

            return [];

        }

    }


    function escaparHTML(valor) {

        if (valor === null || valor === undefined) {
            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function obtener(objeto, propiedades, defecto = "") {

        for (const propiedad of propiedades) {

            if (
                objeto &&
                objeto[propiedad] !== undefined &&
                objeto[propiedad] !== null
            ) {
                return objeto[propiedad];
            }

        }

        return defecto;

    }


    function normalizarArray(datos) {

        if (Array.isArray(datos)) {
            return datos;
        }

        if (datos && Array.isArray(datos.items)) {
            return datos.items;
        }

        if (datos && Array.isArray(datos.data)) {
            return datos.data;
        }

        return [];

    }


    /* =====================================================
       ENCUESTA - OPINIÓN DEL HINCHA
       ===================================================== */

    window.vote = function (opcion) {

        const resultado =
            document.getElementById("pollResult");

        if (!resultado) return;

        const votos = JSON.parse(
            localStorage.getItem(
                "boca247_encuesta"
            ) || "{}"
        );

        votos[opcion] =
            (votos[opcion] || 0) + 1;

        localStorage.setItem(
            "boca247_encuesta",
            JSON.stringify(votos)
        );

        const total =
            Object.values(votos).reduce(
                (a, b) => a + b,
                0
            );

        resultado.innerHTML = `
            <strong>Gracias por votar.</strong><br>
            Tu respuesta fue:
            <strong>${escaparHTML(opcion)}</strong><br><br>
            <span>Total de votos: ${total}</span>
        `;

        mostrarResultadosEncuesta();

    };


    function mostrarResultadosEncuesta() {

        const resultado =
            document.getElementById("pollResult");

        if (!resultado) return;

        const votos = JSON.parse(
            localStorage.getItem(
                "boca247_encuesta"
            ) || "{}"
        );

        const opciones = [
            "Muy bien",
            "Bien",
            "Regular",
            "Mal"
        ];

        const total = opciones.reduce(
            (suma, opcion) =>
                suma + (votos[opcion] || 0),
            0
        );

        if (total === 0) {

            resultado.textContent =
                "Elegí una opción.";

            return;

        }

        let html = `
            <strong>Resultados de la encuesta</strong>
            <div style="margin-top:12px;">
        `;

        opciones.forEach(opcion => {

            const cantidad =
                votos[opcion] || 0;

            const porcentaje =
                Math.round(
                    (cantidad / total) * 100
                );

            html += `
                <div style="margin-bottom:10px;">

                    <div style="
                        display:flex;
                        justify-content:space-between;
                        font-size:12px;
                        font-weight:800;
                    ">
                        <span>
                            ${escaparHTML(opcion)}
                        </span>

                        <span>
                            ${porcentaje}%
                        </span>
                    </div>

                    <div style="
                        height:8px;
                        background:#e5e8ed;
                        margin-top:4px;
                        overflow:hidden;
                    ">

                        <div style="
                            width:${porcentaje}%;
                            height:100%;
                            background:#0052aa;
                        "></div>

                    </div>

                </div>
            `;

        });

        html += `
            </div>
            <small>Total de votos: ${total}</small>
        `;

        resultado.innerHTML = html;

    }


    /* =====================================================
       NOTICIAS
       ===================================================== */

    async function cargarNoticias() {

        const noticias =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.noticias
                )
            );

        const newsGrid =
            document.getElementById("newsGrid");

        if (!newsGrid) return;

        if (!noticias.length) {

            console.warn(
                "BOCA 24/7: no hay noticias disponibles."
            );

            return;

        }

        newsGrid.innerHTML = "";

        noticias.forEach(noticia => {

            const titulo = obtener(
                noticia,
                ["titulo", "title"],
                "Noticias de Boca"
            );

            const categoria = obtener(
                noticia,
                ["categoria", "category"],
                "BOCA"
            );

            const contenido = obtener(
                noticia,
                ["contenido", "texto", "description"],
                ""
            );

            const fecha = obtener(
                noticia,
                ["fecha", "date"],
                ""
            );

            const fuente = obtener(
                noticia,
                ["fuente", "source"],
                ""
            );

            const link = obtener(
                noticia,
                ["link", "url"],
                "#"
            );

            const article =
                document.createElement("article");

            article.className = "news-card";

            article.innerHTML = `

                <div class="news-image image-team">

                    <span>
                        ${escaparHTML(categoria)}
                    </span>

                </div>

                <div class="news-content">

                    <span class="category">
                        ${escaparHTML(categoria)}
                    </span>

                    <h3>
                        ${escaparHTML(titulo)}
                    </h3>

                    <p>
                        ${escaparHTML(contenido)}
                    </p>

                    <span class="news-date">
                        ${escaparHTML(fecha)}
                        ${fuente ? " · " + escaparHTML(fuente) : ""}
                    </span>

                    ${
                        link && link !== "#"
                        ?
                        `
                        <a
                            class="news-read"
                            href="${escaparHTML(link)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            LEER NOTICIA →
                        </a>
                        `
                        :
                        ""
                    }

                </div>

            `;

            newsGrid.appendChild(article);

        });

        activarAnimaciones();

    }


    /* =====================================================
       PARTIDOS
       ===================================================== */

    async function cargarPartidos() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.partidos
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById(
                "fixtures"
            ) ||
            document.getElementById(
                "partidos"
            );

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(partido => {

            const rival = obtener(
                partido,
                ["rival", "oponente", "equipo"],
                "Rival"
            );

            const fecha = obtener(
                partido,
                ["fecha", "date"],
                ""
            );

            const hora = obtener(
                partido,
                ["hora", "time"],
                ""
            );

            const competencia = obtener(
                partido,
                ["competencia", "torneo"],
                ""
            );

            const estadio = obtener(
                partido,
                ["estadio", "venue"],
                ""
            );

            const resultado = obtener(
                partido,
                ["resultado", "score"],
                ""
            );

            const estado = obtener(
                partido,
                ["estado", "status"],
                ""
            );

            const article =
                document.createElement("article");

            article.className = "fixtures article";

            article.innerHTML = `

                <span>
                    ${escaparHTML(competencia)}
                </span>

                <strong>
                    Boca vs. ${escaparHTML(rival)}
                </strong>

                ${
                    resultado
                    ?
                    `<b>${escaparHTML(resultado)}</b>`
                    :
                    ""
                }

                <small>
                    ${escaparHTML(fecha)}
                    ${hora ? " · " + escaparHTML(hora) : ""}
                </small>

                ${
                    estadio
                    ?
                    `<small>${escaparHTML(estadio)}</small>`
                    :
                    ""
                }

                ${
                    estado
                    ?
                    `<small>${escaparHTML(estado)}</small>`
                    :
                    ""
                }

            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       TABLA DE POSICIONES
       ===================================================== */

    async function cargarTabla() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.tabla
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("tabla") ||
            document.getElementById("tablaPosiciones") ||
            document.getElementById("standings");

        if (!contenedor) return;

        const filas =
            datos
                .map((equipo, indice) => {

                    const posicion =
                        obtener(
                            equipo,
                            ["posicion", "position", "puesto"],
                            indice + 1
                        );

                    const nombre =
                        obtener(
                            equipo,
                            ["equipo", "nombre", "team"],
                            ""
                        );

                    const puntos =
                        obtener(
                            equipo,
                            ["puntos", "points", "pts"],
                            0
                        );

                    const pj =
                        obtener(
                            equipo,
                            ["pj", "jugados", "partidos"],
                            0
                        );

                    const pg =
                        obtener(
                            equipo,
                            ["pg", "ganados"],
                            0
                        );

                    const pe =
                        obtener(
                            equipo,
                            ["pe", "empatados"],
                            0
                        );

                    const pp =
                        obtener(
                            equipo,
                            ["pp", "perdidos"],
                            0
                        );

                    const dg =
                        obtener(
                            equipo,
                            ["dg", "diferencia"],
                            0
                        );

                    return `

                        <tr>

                            <td>
                                ${escaparHTML(posicion)}
                            </td>

                            <td>
                                <strong>
                                    ${escaparHTML(nombre)}
                                </strong>
                            </td>

                            <td>
                                ${escaparHTML(pj)}
                            </td>

                            <td>
                                ${escaparHTML(pg)}
                            </td>

                            <td>
                                ${escaparHTML(pe)}
                            </td>

                            <td>
                                ${escaparHTML(pp)}
                            </td>

                            <td>
                                ${escaparHTML(dg)}
                            </td>

                            <td>
                                <strong>
                                    ${escaparHTML(puntos)}
                                </strong>
                            </td>

                        </tr>

                    `;

                })
                .join("");

        contenedor.innerHTML = `

            <div style="overflow-x:auto;">

                <table
                    style="
                        width:100%;
                        border-collapse:collapse;
                        background:white;
                    "
                >

                    <thead>

                        <tr
                            style="
                                background:#001b4d;
                                color:white;
                            "
                        >

                            <th style="padding:12px;">
                                #
                            </th>

                            <th style="padding:12px;text-align:left;">
                                Equipo
                            </th>

                            <th style="padding:12px;">
                                PJ
                            </th>

                            <th style="padding:12px;">
                                PG
                            </th>

                            <th style="padding:12px;">
                                PE
                            </th>

                            <th style="padding:12px;">
                                PP
                            </th>

                            <th style="padding:12px;">
                                DG
                            </th>

                            <th style="padding:12px;">
                                PTS
                            </th>

                        </tr>

                    </thead>

                    <tbody>
                        ${filas}
                    </tbody>

                </table>

            </div>

        `;

    }


    /* =====================================================
       AGENDA
       ===================================================== */

    async function cargarAgenda() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.agenda
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("agenda") ||
            document.getElementById("bocaAgenda");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(item => {

            const fecha =
                obtener(
                    item,
                    ["fecha", "date"],
                    ""
                );

            const hora =
                obtener(
                    item,
                    ["hora", "time"],
                    ""
                );

            const titulo =
                obtener(
                    item,
                    ["titulo", "title", "evento"],
                    ""
                );

            const competencia =
                obtener(
                    item,
                    ["competencia", "torneo"],
                    ""
                );

            const lugar =
                obtener(
                    item,
                    ["lugar", "estadio", "venue"],
                    ""
                );

            const article =
                document.createElement("article");

            article.className = "fixtures";

            article.innerHTML = `

                <span>
                    ${escaparHTML(fecha)}
                    ${hora ? " · " + escaparHTML(hora) : ""}
                </span>

                <strong>
                    ${escaparHTML(titulo)}
                </strong>

                ${
                    competencia
                    ?
                    `<small>${escaparHTML(competencia)}</small>`
                    :
                    ""
                }

                ${
                    lugar
                    ?
                    `<small>${escaparHTML(lugar)}</small>`
                    :
                    ""
                }

            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       MERCADO DE PASES
       ===================================================== */

    async function cargarMercado() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.mercado
                )
       async function cargarMercado() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.mercado
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("mercado") ||
            document.getElementById("marketGrid");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(item => {

            const tipo =
                obtener(
                    item,
                    ["tipo", "operacion"],
                    "MERCADO"
                );

            const jugador =
                obtener(
                    item,
                    ["jugador", "nombre"],
                    ""
                );

            const detalle =
                obtener(
                    item,
                    ["detalle", "contenido", "descripcion"],
                    ""
                );

            const estado =
                obtener(
                    item,
                    ["estado", "status"],
                    ""
                );

            const article =
                document.createElement("article");

            article.className = "market-card";

            article.innerHTML = `

                <span class="market-title">
                    ${escaparHTML(tipo)}
                </span>

                <h3>
                    ${escaparHTML(jugador)}
                </h3>

                <p>
                    ${escaparHTML(detalle)}
                </p>

                ${
                    estado
                    ?
                    `<small>${escaparHTML(estado)}</small>`
                    :
                    ""
                }

            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       OBRAS Y REMODELACIONES
       ===================================================== */

    async function cargarObras() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.obras
                )
            );

        if (!datos.length) return;

        const posibles = [
            "obras",
            "obrasGrid",
            "remodelaciones"
        ];

        let contenedor = null;

        for (const id of posibles) {

            const elemento =
                document.getElementById(id);

            if (elemento) {
                contenedor = elemento;
                break;
            }

        }

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(obra => {

            const nombre =
                obtener(
                    obra,
                    ["titulo", "nombre", "obra"],
                    ""
                );

            const descripcion =
                obtener(
                    obra,
                    ["contenido", "descripcion", "texto"],
                    ""
                );

            const estado =
                obtener(
                    obra,
                    ["estado", "status"],
                    ""
                );

            const article =
                document.createElement("article");

            article.className = "market-card";

            article.innerHTML = `

                <span class="market-title">
                    OBRAS Y REMODELACIONES
                </span>

                <h3>
                    ${escaparHTML(nombre)}
                </h3>

                <p>
                    ${escaparHTML(descripcion)}
                </p>

                ${
                    estado
                    ?
                    `<small>${escaparHTML(estado)}</small>`
                    :
                    ""
                }

            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       VIDEOS
       ===================================================== */

    async function cargarVideos() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.videos
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("videoGrid") ||
            document.getElementById("videos");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(video => {

            const titulo =
                obtener(
                    video,
                    ["titulo", "title"],
                    "Video de Boca"
                );

            const categoria =
                obtener(
                    video,
                    ["categoria", "category"],
                    "VIDEOS"
                );

            const descripcion =
                obtener(
                    video,
                    ["contenido", "descripcion", "texto"],
                    ""
                );

            const link =
                obtener(
                    video,
                    ["link", "url"],
                    "#"
                );

            const imagen =
                obtener(
                    video,
                    ["imagen", "image", "thumbnail"],
                    ""
                );

            const article =
                document.createElement("article");

            article.className = "video-card";

            let fondo = "";

            if (imagen) {

                fondo = `
                    background-image:
                    linear-gradient(
                        180deg,
                        transparent,
                        rgba(0,10,30,.85)
                    ),
                    url('${escaparHTML(imagen)}');
                    background-size:cover;
                    background-position:center;
                `;

            }

            article.innerHTML = `

                <div
                    class="video-cover video-lanus"
                    style="${fondo}"
                >

                    <div class="play">
                        ▶
                    </div>

                    <span>
                        ${escaparHTML(categoria)}
                    </span>

                </div>

                <div class="video-info">

                    <small>
                        ${escaparHTML(categoria)}
                    </small>

                    <h3>
                        ${escaparHTML(titulo)}
                    </h3>

                    <p>
                        ${escaparHTML(descripcion)}
                    </p>

                    ${
                        link && link !== "#"
                        ?
                        `
                        <a
                            href="${escaparHTML(link)}"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            VER VIDEO →
                        </a>
                        `
                        :
                        ""
                    }

                </div>

            `;

            contenedor.appendChild(article);

        });

        activarAnimaciones();

    }


    /* =====================================================
       DISCIPLINAS
       ===================================================== */

    async function cargarDisciplinas() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.disciplinas
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("disciplinas") ||
            document.getElementById("disciplinasGrid");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach(disciplina => {

            const nombre =
                obtener(
                    disciplina,
                    ["titulo", "nombre", "disciplina"],
                    ""
                );

            const descripcion =
                obtener(
                    disciplina,
                    ["contenido", "descripcion", "texto"],
                    ""
                );

            const article =
                document.createElement("article");

            article.className = "news-card";

            article.innerHTML = `

                <div class="news-content">

                    <span class="category">
                        BOCA
                    </span>

                    <h3>
                        ${escaparHTML(nombre)}
                    </h3>

                    <p>
                        ${escaparHTML(descripcion)}
                    </p>

                </div>

            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       HISTORIA + UN DÍA COMO HOY
       ===================================================== */

    async function cargarHistoria() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.historia
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("historia") ||
            document.getElementById("unDiaComoHoy");

        if (!contenedor) return;

        const hoy = new Date();

        const dia =
            String(
                hoy.getDate()
            ).padStart(2, "0");

        const mes =
            String(
                hoy.getMonth() + 1
            ).padStart(2, "0");

        const encontrado =
            datos.find(item => {

                const fecha =
                    obtener(
                        item,
                        ["fecha", "date"],
                        ""
                    );

                return (
                    fecha.includes(`${dia}/${mes}`) ||
                    fecha.includes(`${mes}/${dia}`) ||
                    fecha.includes(`${dia}-${mes}`)
                );

            });

        const item =
            encontrado || datos[0];

        const titulo =
            obtener(
                item,
                ["titulo", "title"],
                "Un día como hoy"
            );

        const contenido =
            obtener(
                item,
                ["contenido", "descripcion", "texto"],
                ""
            );

        const fecha =
            obtener(
                item,
                ["fecha", "date"],
                ""
            );

        contenedor.innerHTML = `

            <div class="history-heading">

                <span class="eyebrow yellow">
                    UN DÍA COMO HOY
                </span>

                <h2>
                    ${escaparHTML(titulo)}
                </h2>

                <p>
                    ${escaparHTML(contenido)}
                </p>

                ${
                    fecha
                    ?
                    `<small>${escaparHTML(fecha)}</small>`
                    :
                    ""
                }

            </div>

        `;

    }


    /* =====================================================
       GALERÍA DE IMÁGENES
       ===================================================== */

    async function cargarGaleria() {

        const datos =
            normalizarArray(
                await cargarJSON(
                    ARCHIVOS.galeria
                )
            );

        if (!datos.length) return;

        const contenedor =
            document.getElementById("galeria") ||
            document.getElementById("photoGrid");

        if (!contenedor) return;

        contenedor.innerHTML = "";

        datos.forEach((foto, indice) => {

            const imagen =
                obtener(
                    foto,
                    ["imagen", "image", "url"],
                    ""
                );

            const titulo =
                obtener(
                    foto,
                    ["titulo", "title", "nombre"],
                    "Boca Juniors"
                );

            const article =
                document.createElement("div");

            article.className =
                `photo-card photo-${indice + 1}`;

            if (imagen) {

                article.style.backgroundImage = `
                    linear-gradient(
                        180deg,
                        transparent,
                        rgba(0,20,55,.9)
                    ),
                    url('${escaparHTML(imagen)}')
                `;

                article.style.backgroundSize =
                    "cover";

                article.style.backgroundPosition =
                    "center";

            }

            article.innerHTML = `
                <span>
                    ${escaparHTML(titulo)}
                </span>
            `;

            contenedor.appendChild(article);

        });

    }


    /* =====================================================
       BOTÓN ACTUALIZAR NOTICIAS
       ===================================================== */

    const reloadNews =
        document.getElementById("reloadNews");

    if (reloadNews) {

        reloadNews.addEventListener(
            "click",
            async function () {

                const textoOriginal =
                    reloadNews.textContent;

                reloadNews.textContent =
                    "ACTUALIZANDO...";

                reloadNews.disabled = true;

                try {

                    await cargarNoticias();

                    reloadNews.textContent =
                        "ACTUALIZADO ✓";

                } catch (error) {

                    console.error(error);

                    reloadNews.textContent =
                        "ERROR";

                }

                setTimeout(() => {

                    reloadNews.textContent =
                        textoOriginal;

                    reloadNews.disabled =
                        false;

                }, 1500);

            }
        );

    }


    /* =====================================================
       TICKER
       ===================================================== */

    const ticker =
        document.getElementById("tickerText");

    if (ticker) {

        const mensajes = [
            "Toda la actualidad de Boca en BOCA 24/7.",
            "Noticias de fútbol y todas las disciplinas.",
            "Partidos, tabla, agenda y mercado de pases.",
            "Boca Predio, obras, videos y entrevistas.",
            "Todo Boca. Todo el día."
        ];

        let posicion = 0;

        setInterval(() => {

            posicion++;

            if (
                posicion >= mensajes.length
            ) {
                posicion = 0;
            }

            ticker.textContent =
                mensajes[posicion];

        }, 5000);

    }


    /* =====================================================
       SCROLL SUAVE
       ===================================================== */

    document
        .querySelectorAll('a[href^="#"]')
        .forEach(enlace => {

            enlace.addEventListener(
                "click",
                function (e) {

                    const destino =
                        this.getAttribute("href");

                    if (
                        !destino ||
                        destino === "#"
                    ) {
                        return;
                    }

                    const elemento =
                        document.querySelector(
                            destino
                        );

                    if (elemento) {

                        e.preventDefault();

                        elemento.scrollIntoView({
                            behavior: "smooth",
                            block: "start"
                        });

                    }

                }
            );

        });


    /* =====================================================
       ANIMACIONES
       ===================================================== */

    function activarAnimaciones() {

        const elementos =
            document.querySelectorAll(
                ".news-card, " +
                ".video-card, " +
                ".market-card, " +
                ".fixtures article, " +
                ".photo-card, " +
                ".fan-card, " +
                ".poll-card"
            );

        if (
            !("IntersectionObserver" in window)
        ) {

            elementos.forEach(elemento => {

                elemento.style.opacity = "1";

                elemento.style.transform =
                    "translateY(0)";

            });

            return;

        }

        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(entry => {

                        if (
                            entry.isIntersecting
                        ) {

                            entry.target.style.opacity =
                                "1";

                            entry.target.style.transform =
                                "translateY(0)";

                            observer.unobserve(
                                entry.target
                            );

                        }

                    });

                },
                {
                    threshold: 0.08
                }
            );

        elementos.forEach(elemento => {

            elemento.style.opacity = "0";

            elemento.style.transform =
                "translateY(15px)";

            elemento.style.transition =
                "opacity .5s ease, transform .5s ease";

            observer.observe(elemento);

        });

    }


    /* =====================================================
       INICIALIZAR TODO
       ===================================================== */

    async function iniciarBoca247() {

        console.log(
            "BOCA 24/7: cargando información..."
        );

        await Promise.allSettled([

            cargarNoticias(),

            cargarPartidos(),

            cargarTabla(),

            cargarAgenda(),

            cargarMercado(),

            cargarObras(),

            cargarVideos(),

            cargarDisciplinas(),

            cargarHistoria(),

            cargarGaleria()

        ]);

        activarAnimaciones();

        mostrarResultadosEncuesta();

        console.log(
            "BOCA 24/7: sistema cargado correctamente."
        );

    }


    /* =====================================================
       ARRANQUE
       ===================================================== */

    iniciarBoca247();

});
