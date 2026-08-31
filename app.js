
/* =========================================================
   BOCA 24/7 - APP.JS
   Sistema principal
   Noticias + partidos + tabla + agenda + mercado +
   obras + videos + disciplinas + predio + historia +
   galería + encuesta + ticker
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
        predio: "predio.json",
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
                    `No se pudo cargar ${archivo} (${respuesta.status})`
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

        if (
            valor === null ||
            valor === undefined
        ) {
            return "";
        }

        return String(valor)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");

    }


    function obtener(
        objeto,
        propiedades,
        defecto = ""
    ) {

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

        if (
            datos &&
            Array.isArray(datos.items)
        ) {
            return datos.items;
        }

        if (
            datos &&
            Array.isArray(datos.data)
        ) {
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

        let votos = {};

        try {

            votos = JSON.parse(
                localStorage.getItem(
                    "boca247_encuesta"
                ) || "{}"
            );

        } catch (error) {

            votos = {};

        }

        votos[opcion] =
            (votos[opcion] || 0) + 1;

        localStorage.setItem(
            "boca247_encuesta",
            JSON.stringify(votos)
        );

        mostrarResultadosEncuesta();

    };


    function mostrarResultadosEncuesta() {

        const resultado =
            document.getElementById("pollResult");

        if (!resultado) return;

        let votos = {};

        try {

            votos = JSON.parse(
                localStorage.getItem(
                    "boca247_encuesta"
                ) || "{}"
            );

        } catch (error) {

            votos = {};

        }

        const opciones = [
            "Muy bien",
            "Bien",
            "Regular",
            "Mal"
        ];

        const total =
            opciones.reduce(
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

            <small>
                Total de votos: ${total}
            </small>
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
            document.getElementById(
                "newsGrid"
            );

        if (!newsGrid) return;

        if (!noticias.length) {

            newsGrid.innerHTML = `
                <div class="empty-state">
                    No hay noticias disponibles.
                </div>
            `;

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
                [
                    "contenido",
                    "texto",
                    "description",
                    "descripcion"
                ],
                ""
            );

            const fecha = obtener(
                noticia,
                [
                    "fecha",
                    "date",
                    "fecha_iso"
                ],
                ""
            );

            const fuente = obtener(
                noticia,
                [
                    "fuente",
                    "source"
                ],
                ""
            );

            const link = obtener(
                noticia,
                [
                    "link",
                    "url"
                ],
                "#"
            );

            const imagen = obtener(
                noticia,
                [
                    "imagen",
                    "image",
                    "thumbnail"
                ],
                ""
            );

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "news-card";

            let estiloImagen = "";

            if (imagen) {

                estiloImagen = `
                    background-image:
                    linear-gradient(
                        180deg,
                        transparent,
                        rgba(0,15,45,.85)
                    ),
                    url('${escaparHTML(imagen)}');
                    background-size:cover;
                    background-position:center;
                `;

            }

            article.innerHTML = `

                <div
                    class="news-image image-team"
                    style="${estiloImagen}"
                >

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

                    ${
                        contenido
                        ?
                        `
                        <p>
                            ${escaparHTML(contenido)}
                        </p>
                        `
                        :
                        ""
                    }

                    <span class="news-date">
                        ${escaparHTML(fecha)}
                        ${
                            fuente
                            ?
                            " · " +
                            escaparHTML(fuente)
                            :
                            ""
                        }
                    </span>

                    ${
                        link &&
                        link !== "#"
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
                [
                    "rival",
                    "oponente",
                    "equipo"
                ],
                "Rival"
            );

            const fecha = obtener(
                partido,
                [
                    "fecha",
                    "date"
                ],
                ""
            );

            const hora = obtener(
                partido,
                [
                    "hora",
                    "time"
                ],
                ""
            );

            const competencia = obtener(
                partido,
                [
                    "competencia",
                    "torneo",
                    "liga"
                ],
                "Partido"
            );

            const resultado = obtener(
                partido,
                [
                    "resultado",
                    "score"
                ],
                ""
            );

            const localia = obtener(
                partido,
                [
                    "localia",
                    "condicion"
                ],
                "Boca"
            );

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "fixture";

            article.innerHTML = `

                <span>
                    ${escaparHTML(competencia)}
                </span>

                <strong>
                    Boca Juniors
                    vs.
                    ${escaparHTML(rival)}
                </strong>

                ${
                    resultado
                    ?
                    `
                    <b>
                        ${escaparHTML(resultado)}
                    </b>
                    `
                    :
                    ""
                }

                <small>
                    ${escaparHTML(fecha)}
                    ${
                        hora
                        ?
                        " · " +
                        escaparHTML(hora)
                        :
                        ""
                    }
                </small>

                <small>
                    ${escaparHTML(localia)}
                </small>

            `;

            contenedor.appendChild(
                article
            );

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

        const posibles = [
            "tabla",
            "tablaGrid",
            "standings",
            "positions"
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

        const tabla =
            document.createElement("div");

        tabla.style.overflowX =
            "auto";

        tabla.innerHTML = `

            <table style="
                width:100%;
                border-collapse:collapse;
                background:white;
                border:1px solid #e0e5eb;
                min-width:600px;
            ">

                <thead>

                    <tr style="
                        background:#001b4d;
                        color:white;
                        text-align:left;
                    ">

                        <th style="padding:14px;">
                            POS
                        </th>

                        <th style="padding:14px;">
                            EQUIPO
                        </th>

                        <th style="padding:14px;">
                            PJ
                        </th>

                        <th style="padding:14px;">
                            G
                        </th>

                        <th style="padding:14px;">
                            E
                        </th>

                        <th style="padding:14px;">
                            P
                        </th>

                        <th style="padding:14px;">
                            PTS
                        </th>

                    </tr>

                </thead>

                <tbody id="tablaBody"></tbody>

            </table>

        `;

        contenedor.innerHTML = "";

        contenedor.appendChild(tabla);

        const tbody =
            tabla.querySelector(
                "#tablaBody"
            );

        datos.forEach(
            (equipo, indice) => {

                const posicion = obtener(
                    equipo,
                    [
                        "posicion",
                        "puesto",
                        "pos"
                    ],
                    indice + 1
                );

                const nombre = obtener(
                    equipo,
                    [
                        "equipo",
                        "nombre",
                        "club"
                    ],
                    ""
                );

                const pj = obtener(
                    equipo,
                    [
                        "pj",
                        "jugados",
                        "partidos"
                    ],
                    0
                );

                const ganados = obtener(
                    equipo,
                    [
                        "g",
                        "ganados",
                        "victorias"
                    ],
                    0
                );

                const empatados = obtener(
                    equipo,
                    [
                        "e",
                        "empatados",
                        "empates"
                    ],
                    0
                );

                const perdidos = obtener(
                    equipo,
                    [
                        "p",
                        "perdidos",
                        "derrotas"
                    ],
                    0
                );

                const puntos = obtener(
                    equipo,
                    [
                        "pts",
                        "puntos"
                    ],
                    0
                );

                const tr =
                    document.createElement(
                        "tr"
                    );

                tr.style.borderBottom =
                    "1px solid #e5e8ed";

                if (
                    String(nombre)
                        .toLowerCase()
                        .includes("boca")
                ) {

                    tr.style.fontWeight =
                        "900";

                    tr.style.background =
                        "#fff8c7";

                }

                tr.innerHTML = `

                    <td style="padding:13px;">
                        ${escaparHTML(posicion)}
                    </td>

                    <td style="
                        padding:13px;
                        font-weight:800;
                    ">
                        ${escaparHTML(nombre)}
                    </td>

                    <td style="padding:13px;">
                        ${escaparHTML(pj)}
                    </td>

                    <td style="padding:13px;">
                        ${escaparHTML(ganados)}
                    </td>

                    <td style="padding:13px;">
                        ${escaparHTML(empatados)}
                    </td>

                    <td style="padding:13px;">
                        ${escaparHTML(perdidos)}
                    </td>

                    <td style="
                        padding:13px;
                        font-weight:9
