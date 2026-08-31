/* =========================================================
   BOCA 24/7 - APP.JS
   SISTEMA PRINCIPAL
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
       UTILIDADES
       ===================================================== */

    async function cargarJSON(archivo) {

        try {

            const respuesta = await fetch(
                "./" + archivo + "?v=" + Date.now(),
                {
                    cache: "no-store"
                }
            );

            if (!respuesta.ok) {
                throw new Error(
                    archivo + " respondió " + respuesta.status
                );
            }

            const texto = await respuesta.text();

            if (!texto.trim()) {
                throw new Error(
                    archivo + " está vacío"
                );
            }

            return JSON.parse(texto);

        } catch (error) {

            console.error(
                "BOCA 24/7 | Error cargando " +
                archivo +
                ":",
                error
            );

            return null;
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


    function obtener(objeto, propiedades, defecto = "") {

        if (
            !objeto ||
            typeof objeto !== "object"
        ) {
            return defecto;
        }

        for (const propiedad of propiedades) {

            if (
                objeto[propiedad] !== undefined &&
                objeto[propiedad] !== null &&
                objeto[propiedad] !== ""
            ) {
                return objeto[propiedad];
            }
        }

        return defecto;
    }


    function normalizarArray(datos, claves = []) {

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

        for (const clave of claves) {

            if (
                datos &&
                Array.isArray(datos[clave])
            ) {
                return datos[clave];
            }
        }

        return [];
    }


    function buscarElemento(ids = [], selectores = []) {

        for (const id of ids) {

            const elemento =
                document.getElementById(id);

            if (elemento) {
                return elemento;
            }
        }

        for (const selector of selectores) {

            const elemento =
                document.querySelector(selector);

            if (elemento) {
                return elemento;
            }
        }

        return null;
    }


    function mensajeVacio(contenedor, titulo) {

        if (!contenedor) return;

        contenedor.innerHTML = `
            <div style="
                background:#fff;
                border:1px solid #e4e7ec;
                border-radius:14px;
                padding:20px;
                color:#667085;
            ">
                <strong style="color:#00245f;">
                    ${escaparHTML(titulo)}
                </strong>
                <p style="margin-top:6px;">
                    No hay información disponible en este momento.
                </p>
            </div>
        `;
    }


    /* =====================================================
       NOTICIAS
       ===================================================== */

    async function cargarNoticias() {

        const datos =
            await cargarJSON(
                ARCHIVOS.noticias
            );

        const noticias =
            normalizarArray(
                datos,
                [
                    "noticias",
                    "news",
                    "articles"
                ]
            );

        const destacados =
            buscarElemento(
                [
                    "newsGrid",
                    "destacadas"
                ],
                [
                    "#noticias .grid",
                    "#noticias .noticias-grid"
                ]
            );

        const desarrolladas =
            buscarElemento(
                [
                    "desarrolladas"
                ],
                [
                    "#noticiasDesarrolladas .featured",
                    "#desarrolladas"
                ]
            );

        if (!noticias.length) {

            mensajeVacio(
                destacados,
                "Noticias"
            );

            mensajeVacio(
                desarrolladas,
                "Noticias desarrolladas"
            );

            return;
        }


        /* ================================================
           DESTACADAS
           ================================================ */

        if (destacados) {

            destacados.innerHTML = "";

            noticias
                .slice(0, 6)
                .forEach(noticia => {

                    const titulo =
                        obtener(
                            noticia,
                            [
                                "titulo",
                                "title",
                                "nombre"
                            ],
                            "Noticias de Boca"
                        );

                    const fuente =
                        obtener(
                            noticia,
                            [
                                "fuente",
                                "source",
                                "medio"
                            ],
                            "BOCA 24/7"
                        );

                    const contenido =
                        obtener(
                            noticia,
                            [
                                "contenido",
                                "texto",
                                "descripcion",
                                "description",
                                "resumen"
                            ],
                            ""
                        );

                    const fecha =
                        obtener(
                            noticia,
                            [
                                "fecha",
                                "date",
                                "fecha_iso"
                            ],
                            ""
                        );

                    const link =
                        obtener(
                            noticia,
                            [
                                "link",
                                "url",
                                "enlace"
                            ],
                            ""
                        );

                    const categoria =
                        obtener(
                            noticia,
                            [
                                "categoria",
                                "category",
                                "seccion"
                            ],
                            "BOCA"
                        );


                    const article =
                        document.createElement(
                            "article"
                        );

                    article.className =
                        "card news-card";

                    article.innerHTML = `

                        <span class="source">
                            ${escaparHTML(fuente)}
                        </span>

                        <div style="
                            margin-top:7px;
                            color:#f5c400;
                            font-size:11px;
                            font-weight:900;
                        ">
                            ${escaparHTML(categoria)}
                        </div>

                        <h3>
                            ${escaparHTML(titulo)}
                        </h3>

                        <p>
                            ${escaparHTML(contenido)}
                        </p>

                        ${
                            fecha
                            ?
                            `
                            <div class="meta">
                                ${escaparHTML(fecha)}
                            </div>
                            `
                            :
                            ""
                        }

                        ${
                            link
                            ?
                            `
                            <a
                                class="btn"
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

                    `;

                    destacados.appendChild(
                        article
                    );

                });
        }


        /* ================================================
           NOTICIAS DESARROLLADAS
           ================================================ */

        if (desarrolladas) {

            desarrolladas.innerHTML = "";

            noticias
                .slice(0, 10)
                .forEach(noticia => {

                    const titulo =
                        obtener(
                            noticia,
                            [
                                "titulo",
                                "title"
                            ],
                            "Noticias de Boca"
                        );

                    const fuente =
                        obtener(
                            noticia,
                            [
                                "fuente",
                                "source"
                            ],
                            "BOCA 24/7"
                        );

                    const contenido =
                        obtener(
                            noticia,
                            [
                                "contenido",
                                "texto",
                                "descripcion",
                                "description"
                            ],
                            ""
                        );

                    const link =
                        obtener(
                            noticia,
                            [
                                "link",
                                "url"
                            ],
                            ""
                        );

                    const fecha =
                        obtener(
                            noticia,
                            [
                                "fecha",
                                "date",
                                "fecha_iso"
                            ],
                            ""
                        );

                    const article =
                        document.createElement(
                            "article"
                        );

                    article.className =
                        "card news-card";

                    article.innerHTML = `

                        <span class="source">
                            ${escaparHTML(fuente)}
                        </span>

                        <h3>
                            ${escaparHTML(titulo)}
                        </h3>

                        <p>
                            ${escaparHTML(contenido)}
                        </p>

                        ${
                            fecha
                            ?
                            `
                            <div class="meta">
                                ${escaparHTML(fecha)}
                            </div>
                            `
                            :
                            ""
                        }

                        ${
                            link
                            ?
                            `
                            <a
                                class="btn"
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

                    `;

                    desarrolladas.appendChild(
                        article
                    );

                });
        }


        actualizarFecha();

        activarAnimaciones();
    }


    /* =====================================================
       PARTIDOS
       ===================================================== */

    async function cargarPartidos() {

        const datos =
            await cargarJSON(
                ARCHIVOS.partidos
            );

        const partidos =
            normalizarArray(
                datos,
                [
                    "partidos",
                    "matches",
                    "fixtures"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "fixtures",
                    "listaPartidos"
                ],
                [
                    "#partidos .match",
                    "#partidos .partido"
                ]
            );

        if (!contenedor) return;

        if (!partidos.length) {

            mensajeVacio(
                contenedor,
                "Partidos"
            );

            return;
        }

        contenedor.innerHTML = "";

        partidos
            .slice(0, 8)
            .forEach(partido => {

                const titulo =
                    obtener(
                        partido,
                        [
                            "partido",
                            "titulo",
                            "nombre"
                        ],
                        ""
                    );

                const rival =
                    obtener(
                        partido,
                        [
                            "rival",
                            "oponente",
                            "equipo"
                        ],
                        ""
                    );

                const fecha =
                    obtener(
                        partido,
                        [
                            "fecha",
                            "date"
                        ],
                        ""
                    );

                const hora =
                    obtener(
                        partido,
                        [
                            "hora",
                            "time"
                        ],
                        ""
                    );

                const competencia =
                    obtener(
                        partido,
                        [
                            "competencia",
                            "torneo",
                            "liga"
                        ],
                        ""
                    );

                const estadio =
                    obtener(
                        partido,
                        [
                            "estadio",
                            "venue",
                            "lugar"
                        ],
                        ""
                    );

                const resultado =
                    obtener(
                        partido,
                        [
                            "resultado",
                            "score"
                        ],
                        ""
                    );

                const article =
                    document.createElement(
                        "article"
                    );

                article.className =
                    "match";

                article.innerHTML = `

                    ${
                        competencia
                        ?
                        `
                        <div class="comp">
                            ${escaparHTML(competencia)}
                        </div>
                        `
                        :
                        ""
                    }

                    <h2>
                        ${
                            escaparHTML(
                                titulo ||
                                (
                                    rival
                                    ?
                                    "BOCA JUNIORS 🆚 " + rival
                                    :
                                    "BOCA JUNIORS"
                                )
                            )
                        }
                    </h2>

                    ${
                        fecha || hora
                        ?
                        `
                        <div class="date">
                            ${escaparHTML(fecha)}
                            ${
                                hora
                                ?
                                " · " +
                                escaparHTML(hora)
                                :
                                ""
                            }
                        </div>
                        `
                        :
                        ""
                    }

                    ${
                        resultado
                        ?
                        `
                        <p>
                            Resultado:
                            <strong>
                                ${escaparHTML(resultado)}
                            </strong>
                        </p>
                        `
                        :
                        ""
                    }

                    ${
                        estadio
                        ?
                        `
                        <p>
                            🏟️ ${escaparHTML(estadio)}
                        </p>
                        `
                        :
                        ""
                    }

                `;

                contenedor.appendChild(
                    article
                );

            });

    }


    /* =====================================================
       TABLA
       ===================================================== */

    async function cargarTabla() {

        const datos =
            await cargarJSON(
                ARCHIVOS.tabla
            );

        const equipos =
            normalizarArray(
                datos,
                [
                    "tabla",
                    "posiciones",
                    "standings",
                    "teams"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "tabla",
                    "tablaGrid",
                    "standings",
                    "positions"
                ],
                [
                    "#tablaPosiciones",
                    ".tabla"
                ]
            );

        if (!contenedor) return;

        if (!equipos.length) {

            mensajeVacio(
                contenedor,
                "Tabla de posiciones"
            );

            return;
        }

        const filas =
            equipos
                .map((equipo, indice) => {

                    const posicion =
                        obtener(
                            equipo,
                            [
                                "posicion",
                                "position",
                                "puesto",
                                "pos"
                            ],
                            indice + 1
                        );

                    const nombre =
                        obtener(
                            equipo,
                            [
                                "equipo",
                                "nombre",
                                "club",
                                "team"
                            ],
                            ""
                        );

                    const pj =
                        obtener(
                            equipo,
                            [
                                "pj",
                                "jugados",
                                "partidos"
                            ],
                            0
                        );

                    const pg =
                        obtener(
                            equipo,
                            [
                                "pg",
                                "g",
                                "ganados",
                                "victorias"
                            ],
                            0
                        );

                    const pe =
                        obtener(
                            equipo,
                            [
                                "pe",
                                "e",
                                "empatados",
                                "empates"
                            ],
                            0
                        );

                    const pp =
                        obtener(
                            equipo,
                            [
                                "pp",
                                "p",
                                "perdidos",
                                "derrotas"
                            ],
                            0
                        );

                    const dg =
                        obtener(
                            equipo,
                            [
                                "dg",
                                "diferencia",
                                "diferencia_goles"
                            ],
                            0
                        );

                    const puntos =
                        obtener(
                            equipo,
                            [
                                "pts",
                                "puntos",
                                "points"
                            ],
                            0
                        );

                    const esBoca =
                        String(nombre)
                            .toLowerCase()
                            .includes("boca");

                    return `

                        <tr
                            style="
                                ${
                                    esBoca
                                    ?
                                    "background:#fff7c2;font-weight:900;"
                                    :
                                    ""
                                }
                                border-bottom:1px solid #e5e7eb;
                            "
                        >

                            <td style="padding:11px;">
                                ${escaparHTML(posicion)}
                            </td>

                            <td style="
                                padding:11px;
                                text-align:left;
                            ">
                                ${escaparHTML(nombre)}
                            </td>

                            <td style="padding:11px;">
                                ${escaparHTML(pj)}
                            </td>

                            <td style="padding:11px;">
                                ${escaparHTML(pg)}
                            </td>

                            <td style="padding:11px;">
                                ${escaparHTML(pe)}
                            </td>

                            <td style="padding:11px;">
                                ${escaparHTML(pp)}
                            </td>

                            <td style="padding:11px;">
                                ${escaparHTML(dg)}
                            </td>

                            <td style="padding:11px;font-weight:900;">
                                ${escaparHTML(puntos)}
                            </td>

                        </tr>
                    `;
                })
                .join("");


        contenedor.innerHTML = `

            <div style="overflow-x:auto;">

                <table style="
                    width:100%;
                    min-width:620px;
                    border-collapse:collapse;
                    background:#fff;
                    text-align:center;
                ">

                    <thead>

                        <tr style="
                            background:#00245f;
                            color:#fff;
                        ">

                            <th style="padding:12px;">
                                POS
                            </th>

                            <th style="
                                padding:12px;
                                text-align:left;
                            ">
                                EQUIPO
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
            await cargarJSON(
                ARCHIVOS.agenda
            );

        const eventos =
            normalizarArray(
                datos,
                [
                    "agenda",
                    "eventos",
                    "events"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "agenda",
                    "agendaLista",
                    "agendaGrid"
                ],
                [
                    "#agenda .calendar",
                    "#agenda .agenda"
                ]
            );

        if (!contenedor) return;

        if (!eventos.length) {

            mensajeVacio(
                contenedor,
                "Agenda de Boca"
            );

            return;
        }

        contenedor.innerHTML = "";

        eventos
            .slice(0, 20)
            .forEach(evento => {

                const titulo =
                    obtener(
                        evento,
                        [
                            "titulo",
                            "title",
                            "evento",
                            "nombre"
                        ],
                        "Evento de Boca"
                    );

                const fecha =
                    obtener(
                        evento,
                        [
                            "fecha",
                            "date"
                        ],
                        ""
                    );

                const hora =
                    obtener(
                        evento,
                        [
                            "hora",
                            "time"
                        ],
                        ""
                    );

                const competencia =
                    obtener(
                        evento,
                        [
                            "competencia",
                            "torneo",
                            "liga"
                        ],
                        ""
                    );

                const lugar =
                    obtener(
                        evento,
                        [
                            "lugar",
                            "estadio",
                            "venue"
                        ],
                        ""
                    );

                const article =
                    document.createElement(
                        "div"
                    );

                article.className =
                    "event";

                article.innerHTML = `

                    <strong>
                        ${escaparHTML(fecha)}
                        ${
                            hora
                            ?
                            " · " +
                            escaparHTML(hora)
                            :
                            ""
                        }
                    </strong>

                    <div style="
                        margin-top:4px;
                        font-weight:700;
                    ">
                        ${escaparHTML(titulo)}
                    </div>

                    ${
                        competencia
                        ?
                        `
                        <small>
                            ${escaparHTML(competencia)}
                        </small>
                        `
                        :
                        ""
                    }

                    ${
                        lugar
                        ?
                        `
                        <small>
                            🏟️ ${escaparHTML(lugar)}
                        </small>
                        `
                        :
                        ""
                    }

                `;

                contenedor.appendChild(
                    article
                );

            });

    }


    /* =====================================================
       MERCADO DE PASES
       ===================================================== */

    async function cargarMercado() {

        const datos =
            await cargarJSON(
                ARCHIVOS.mercado
            );

        const movimientos =
            normalizarArray(
                datos,
                [
                    "mercado",
                    "movimientos",
                    "operaciones",
                    "players"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "marketGrid",
                    "mercado"
                ],
                [
                    "#mercado .market",
                    "#mercado .mercado-grid"
                ]
            );

        if (!contenedor) return;

        if (!movimientos.length) {

            mensajeVacio(
                contenedor,
                "Mercado de pases"
            );

            return;
        }

        contenedor.innerHTML = "";

        const grupos = {
            llegada: [],
            negociacion: [],
            salida: []
        };


        movimientos.forEach(item => {

            const tipo =
                String(
                    obtener(
                        item,
                        [
                            "tipo",
                            "operacion",
                            "estado",
                            "status"
                        ],
                        ""
                    )
                ).toLowerCase();

            const jugador =
                obtener(
                    item,
                    [
                        "jugador",
                        "nombre",
                        "player"
                    ],
                    "Jugador"
                );

            const detalle =
                obtener(
                    item,
                    [
                        "detalle",
                        "contenido",
                        "descripcion",
                        "texto"
                    ],
                    ""
                );

            if (
                tipo.includes("salid") ||
                tipo.includes("baja") ||
                tipo.includes("venta") ||
                tipo.includes("préstamo")
            ) {

                grupos.salida.push({
                    jugador,
                    detalle
                });

            } else if (
                tipo.includes("negoci") ||
                tipo.includes("interés") ||
                tipo.includes("interes")
            ) {

                grupos.negociacion.push({
                    jugador,
                    detalle
                });

            } else {

                grupos.llegada.push({
                    jugador,
                    detalle
                });

            }

        });


        function crearGrupo(
            titulo,
            items,
            clase
        ) {

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "card " + clase;

            article.innerHTML = `

                <h3>
                    ${titulo}
                </h3>

                <div class="market-items">
                    ${
                        items.length
                        ?
                        items.map(item => `
                            <div style="
                                padding:10px 0;
                                border-bottom:1px solid #eee;
                            ">

                                <strong>
                                    ${escaparHTML(
                                        item.jugador
                                    )}
                                </strong>

                                ${
                                    item.detalle
                                    ?
                                    `
                                    <p style="
                                        margin-top:4px;
                                        font-size:13px;
                                        color:#667085;
                                    ">
                                        ${escaparHTML(
                                            item.detalle
                                        )}
                                    </p>
                                    `
                                    :
                                    ""
                                }

                            </div>
                        `).join("")
                        :
                        `
                        <p style="color:#667085;">
                            Sin novedades registradas.
                        </p>
                        `
                    }
                </div>
            `;

            contenedor.appendChild(
                article
            );
        }


        crearGrupo(
            "🟢 LLEGADAS",
            grupos.llegada,
            "in"
        );

        crearGrupo(
            "🟡 EN NEGOCIACIÓN",
            grupos.negociacion,
            "neg"
        );

        crearGrupo(
            "🔴 SALIDAS",
            grupos.salida,
            "out"
        );

    }


    /* =====================================================
       VIDEOS
       ===================================================== */

    async function cargarVideos() {

        const datos =
            await cargarJSON(
                ARCHIVOS.videos
            );

        const videos =
            normalizarArray(
                datos,
                [
                    "videos",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "videoGrid",
                    "videos"
                ],
                [
                    "#videos .videos",
                    "#videos .videos-grid"
                ]
            );

        if (!contenedor) return;

        if (!videos.length) {

            mensajeVacio(
                contenedor,
                "Videos"
            );

            return;
        }

        contenedor.innerHTML = "";

        videos
            .slice(0, 12)
            .forEach(video => {

                const titulo =
                    obtener(
                        video,
                        [
                            "titulo",
                            "title",
                            "nombre"
                        ],
                        "Video de Boca"
                    );

                const descripcion =
                    obtener(
                        video,
                        [
                            "descripcion",
                            "contenido",
                            "texto"
                        ],
                        ""
                    );

                const link =
                    obtener(
                        video,
                        [
                            "link",
                            "url",
                            "youtube"
                        ],
                        ""
                    );

                const videoId =
                    obtener(
                        video,
                        [
                            "videoId",
                            "video_id",
                            "youtube_id",
                            "id"
                        ],
                        ""
                    );


                let iframe = "";

                if (videoId) {

                    iframe = `
                        <iframe
                            src="https://www.youtube.com/embed/${escaparHTML(videoId)}"
                            title="${escaparHTML(titulo)}"
                            loading="lazy"
                            allowfullscreen
                        ></iframe>
                    `;

                } else if (
                    link &&
                    (
                        link.includes("youtube.com") ||
                        link.includes("youtu.be")
                    )
                ) {

                    let id = "";

                    if (
                        link.includes("youtu.be/")
                    ) {

                        id =
                            link
                                .split("youtu.be/")[1]
                                .split("?")[0];

                    } else if (
                        link.includes("v=")
                    ) {

                        id =
                            link
                                .split("v=")[1]
                                .split("&")[0];

                    }

                    if (id) {

                        iframe = `
                            <iframe
                                src="https://www.youtube.com/embed/${escaparHTML(id)}"
                                title="${escaparHTML(titulo)}"
                                loading="lazy"
                                allowfullscreen
                            ></iframe>
                        `;
                    }
                }


                const article =
                    document.createElement(
                        "article"
                    );

                article.className =
                    "video";

                article.innerHTML = `

                    ${
                        iframe
                        ?
                        iframe
                        :
                        `
                        <div style="
                            aspect-ratio:16/9;
                            display:flex;
                            align-items:center;
                            justify-content:center;
                            background:#00245f;
                            color:#f5c400;
                            font-size:40px;
                        ">
                            ▶
                        </div>
                        `
                    }

                    <div class="info">

                        <h3>
                            ${escaparHTML(titulo)}
                        </h3>

                        ${
                            descripcion
                            ?
                            `
                            <p>
                                ${escaparHTML(
                                    descripcion
                                )}
                            </p>
                            `
                            :
                            ""
                        }

                        ${
                            link
                            ?
                            `
                            <a
                                class="btn"
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

                contenedor.appendChild(
                    article
                );

            });

    }


    /* =====================================================
       DISCIPLINAS
       ===================================================== */

    async function cargarDisciplinas() {

        const datos =
            await cargarJSON(
                ARCHIVOS.disciplinas
            );

        const disciplinas =
            normalizarArray(
                datos,
                [
                    "disciplinas",
                    "sports",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "disciplinas",
                    "disciplinasGrid",
                    "sportsGrid"
                ],
                [
                    "#disciplinas .grid",
                    "#disciplinas .noticias-grid"
                ]
            );

        if (!contenedor) return;

        if (!disciplinas.length) {

            mensajeVacio(
                contenedor,
                "Disciplinas"
            );

            return;
        }

        contenedor.innerHTML = "";

        disciplinas.forEach(item => {

            const titulo =
                obtener(
                    item,
                    [
                        "titulo",
                        "nombre",
                        "disciplina"
                    ],
                    "Boca"
                );

            const descripcion =
                obtener(
                    item,
                    [
                        "descripcion",
                        "contenido",
                        "texto"
                    ],
                    ""
                );

            const imagen =
                obtener(
                    item,
                    [
                        "imagen",
                        "image",
                        "foto"
                    ],
                    ""
                );

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "card";

            article.innerHTML = `

                ${
                    imagen
                    ?
                    `
                    <img
                        src="${escaparHTML(imagen)}"
                        alt="${escaparHTML(titulo)}"
                        style="
                            width:100%;
                            height:180px;
                            object-fit:cover;
                            border-radius:10px;
                            margin-bottom:12px;
                        "
                    >
                    `
                    :
                    ""
                }

                <h3>
                    ${escaparHTML(titulo)}
                </h3>

                <p>
                    ${escaparHTML(descripcion)}
                </p>

            `;

            contenedor.appendChild(
                article
            );

        });

    }


    /* =====================================================
       BOCA PREDIO / INFERIORES
       ===================================================== */

    async function cargarPredio() {

        const datos =
            await cargarJSON(
                ARCHIVOS.predio
            );

        const items =
            normalizarArray(
                datos,
                [
                    "predio",
                    "inferiores",
                    "juveniles",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "predio",
                    "predioGrid",
                    "inferiores"
                ],
                [
                    "#predio .grid",
                    "#inferiores .grid"
                ]
            );

        if (!contenedor) return;

        if (!items.length) {

            mensajeVacio(
                contenedor,
                "Boca Predio"
            );

            return;
        }

        contenedor.innerHTML = "";

        items.forEach(item => {

            const titulo =
                obtener(
                    item,
                    [
                        "titulo",
                        "nombre",
                        "categoria"
                    ],
                    "Boca Predio"
                );

            const contenido =
                obtener(
                    item,
                    [
                        "contenido",
                        "descripcion",
                        "texto"
                    ],
                    ""
                );

            const fecha =
                obtener(
                    item,
                    [
                        "fecha",
                        "date"
                    ],
                    ""
                );

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "card";

            article.innerHTML = `

                <span class="source">
                    BOCA PREDIO
                </span>

                <h3>
                    ${escaparHTML(titulo)}
                </h3>

                <p>
                    ${escaparHTML(contenido)}
                </p>

                ${
                    fecha
                    ?
                    `
                    <div class="meta">
                        ${escaparHTML(fecha)}
                    </div>
                    `
                    :
                    ""
                }

            `;

            contenedor.appendChild(
                article
            );

        });

    }


    /* =====================================================
       OBRAS
       ===================================================== */

    async function cargarObras() {

        const datos =
            await cargarJSON(
                ARCHIVOS.obras
            );

        const obras =
            normalizarArray(
                datos,
                [
                    "obras",
                    "remodelaciones",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "obras",
                    "obrasGrid",
                    "remodelaciones"
                ],
                [
                    "#obras .grid",
                    "#obras .featured"
                ]
            );

        if (!contenedor) return;

        if (!obras.length) {

            mensajeVacio(
                contenedor,
                "Obras y remodelaciones"
            );

            return;
        }

        contenedor.innerHTML = "";

        obras.forEach(obra => {

            const titulo =
                obtener(
                    obra,
                    [
                        "titulo",
                        "nombre",
                        "obra"
                    ],
                    "Obras de Boca"
                );

            const descripcion =
                obtener(
                    obra,
                    [
                        "descripcion",
                        "contenido",
                        "texto"
                    ],
                    ""
                );

            const estado =
                obtener(
                    obra,
                    [
                        "estado",
                        "status"
                    ],
                    ""
                );

            const imagen =
                obtener(
                    obra,
                    [
                        "imagen",
                        "image",
                        "foto"
                    ],
                    ""
                );

            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "card";

            article.innerHTML = `

                ${
                    imagen
                    ?
                    `
                    <img
                        src="${escaparHTML(imagen)}"
                        alt="${escaparHTML(titulo)}"
                        style="
                            width:100%;
                            height:180px;
                            object-fit:cover;
                            border-radius:10px;
                            margin-bottom:12px;
                        "
                    >
                    `
                    :
                    ""
                }

                <h3>
                    ${escaparHTML(titulo)}
                </h3>

                <p>
                    ${escaparHTML(descripcion)}
                </p>

                ${
                    estado
                    ?
                    `
                    <div class="meta">
                        Estado:
                        ${escaparHTML(estado)}
                    </div>
                    `
                    :
                    ""
                }

            `;

            contenedor.appendChild(
                article
            );

        });

    }


    /* =====================================================
       HISTORIA
       ===================================================== */

    async function cargarHistoria() {

        const datos =
            await cargarJSON(
                ARCHIVOS.historia
            );

        const historia =
            normalizarArray(
                datos,
                [
                    "historia",
                    "history",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "historia",
                    "historiaLista",
                    "unDiaComoHoy",
                    "history"
                ],
                [
                    "#historia .history",
                    "#historia"
                ]
            );

        if (!contenedor) return;

        if (!historia.length) {

            return;
        }


        const ahora =
            new Date();

        const dia =
            String(
                ahora.getDate()
            ).padStart(2, "0");

        const mes =
            String(
                ahora.getMonth() + 1
            ).padStart(2, "0");


        let encontrado =
            historia.find(item => {

                const fecha =
                    String(
                        obtener(
                            item,
                            [
                                "fecha",
                                "date"
                            ],
                            ""
                        )
                    );

                return (
                    fecha.includes(
                        dia + "/" + mes
                    ) ||
                    fecha.includes(
                        dia + "-" + mes
                    ) ||
                    fecha.includes(
                        mes + "/" + dia
                    ) ||
                    fecha.includes(
                        mes + "-" + dia
                    )
                );

            });


        if (!encontrado) {

            encontrado =
                historia[0];
        }


        const titulo =
            obtener(
                encontrado,
                [
                    "titulo",
                    "title",
                    "nombre"
                ],
                "Un día como hoy"
            );

        const contenido =
            obtener(
                encontrado,
                [
                    "contenido",
                    "descripcion",
                    "texto"
                ],
                ""
            );

        const fecha =
            obtener(
                encontrado,
                [
                    "fecha",
                    "date"
                ],
                ""
            );


        const destino =
            contenedor.id === "historia"
            ?
            contenedor
            :
            contenedor;


        destino.innerHTML = `

            <div class="history">

                <h3>
                    ${escaparHTML(titulo)}
                </h3>

                <p>
                    ${escaparHTML(contenido)}
                </p>

                ${
                    fecha
                    ?
                    `
                    <div class="meta">
                        ${escaparHTML(fecha)}
                    </div>
                    `
                    :
                    ""
                }

            </div>

        `;

    }


    /* =====================================================
       GALERÍA
       ===================================================== */

    async function cargarGaleria() {

        const datos =
            await cargarJSON(
                ARCHIVOS.galeria
            );

        const fotos =
            normalizarArray(
                datos,
                [
                    "galeria",
                    "fotos",
                    "images",
                    "items"
                ]
            );

        const contenedor =
            buscarElemento(
                [
                    "galeria",
                    "photoGrid",
                    "galeriaGrid",
                    "fotos"
                ],
                [
                    "#galeria .grid",
                    "#galeria .gallery",
                    "#galeria .galeria-grid"
                ]
            );

        if (!contenedor) return;

        if (!fotos.length) {

            mensajeVacio(
                contenedor,
                "Galería"
            );

            return;
        }

        contenedor.innerHTML = "";

        fotos.forEach((foto, indice) => {

            const imagen =
                obtener(
                    foto,
                    [
                        "imagen",
                        "image",
                        "url",
                        "foto"
                    ],
                    ""
                );

            const titulo =
                obtener(
                    foto,
                    [
                        "titulo",
                        "title",
                        "nombre"
                    ],
                    "Boca Juniors"
                );


            const article =
                document.createElement(
                    "article"
                );

            article.className =
                "photo-card";


            if (imagen) {

                article.style.backgroundImage =
                    `
                    linear-gradient(
                        180deg,
                        transparent,
                        rgba(0,15,45,.9)
                    ),
                    url("${escaparHTML(imagen)}")
                    `;

                article.style.backgroundSize =
                    "cover";

                article.style.backgroundPosition =
                    "center";

                article.style.minHeight =
                    "220px";

                article.style.borderRadius =
                    "14px";

                article.style.position =
                    "relative";

                article.style.overflow =
                    "hidden";

            }


            article.innerHTML = `

                <span style="
                    position:absolute;
                    left:12px;
                    right:12px;
                    bottom:12px;
                    color:white;
                    font-weight:900;
                ">
                    ${escaparHTML(titulo)}
                </span>

            `;


            contenedor.appendChild(
                article
            );

        });

    }


    /* =====================================================
       ENCUESTA
       ===================================================== */

    let votoSeleccionado = null;


    window.seleccionar = function(indice) {

        votoSeleccionado =
            indice;

        document
            .querySelectorAll(
                ".opcion"
            )
            .forEach(
                (boton, i) => {

                    boton.classList.toggle(
                        "seleccionada",
                        i === indice
                    );

                }
            );
    };


    window.votar = function() {

        if (
            votoSeleccionado === null
        ) {

            alert(
                "Elegí una opción antes de votar."
            );

            return;
        }


        const votos =
            JSON.parse(
                localStorage.getItem(
                    "boca247_votos"
                ) ||
                '{"paredes":0,"zenon":0}'
            );


        if (
            votoSeleccionado === 0
        ) {

            votos.paredes =
                Number(
                    votos.paredes || 0
                ) + 1;

        } else {

            votos.zenon =
                Number(
                    votos.zenon || 0
                ) + 1;
        }


        localStorage.setItem(
            "boca247_votos",
            JSON.stringify(votos)
        );


        const total =
            votos.paredes +
            votos.zenon;


        const porcentajeParedes =
            total
            ?
            Math.round(
                votos.paredes /
                total *
                100
            )
            :
            0;


        const resultado =
            document.getElementById(
                "resultado"
            ) ||
            document.getElementById(
                "pollResult"
            );


        if (resultado) {

            resultado.innerHTML = `

                <strong>
                    Resultado actual
                </strong>

                <br><br>

                🔵 Leandro Paredes —
                ${porcentajeParedes}%

                <br>

                🟡 Kevin Zenón —
                ${100 - porcentajeParedes}%

                <br><br>

                Total de votos:
                ${total}

            `;
        }

    };


    function mostrarEncuestaGuardada() {

        const resultado =
            document.getElementById(
                "resultado"
            ) ||
            document.getElementById(
                "pollResult"
            );

        if (!resultado) return;


        const votos =
            JSON.parse(
                localStorage.getItem(
                    "boca247_votos"
                ) ||
                '{"paredes":0,"zenon":0}'
            );


        const paredes =
            Number(
                votos.paredes || 0
            );

        const zenon =
            Number(
                votos.zenon || 0
            );

        const total =
            paredes + zenon;


        if (!total) {

            resultado.textContent =
                "Todavía no hay votos registrados en este dispositivo.";

            return;
        }


        const porcentaje =
            Math.round(
                paredes /
                total *
                100
            );


        resultado.innerHTML = `

            Resultado actual:

            <br><br>

            🔵 Leandro Paredes —
            ${porcentaje}%

            <br>

            🟡 Kevin Zenón —
            ${100 - porcentaje}%

            <br><br>

            Total de votos:
            ${total}

        `;
    }


    /* =====================================================
       RELOJ / ACTUALIZACIÓN
       ===================================================== */

    function actualizarFecha() {

        const elementos = [
            "updated",
            "actualizado"
        ];

        let destino = null;

        for (
            const id of elementos
        ) {

            const elemento =
                document.getElementById(
                    id
                );

            if (elemento) {

                destino =
                    elemento;

                break;
            }
        }

        if (!destino) return;


        const ahora =
            new Date();


        destino.textContent =
            "Última actualización: " +
            ahora.toLocaleDateString(
                "es-AR"
            ) +
            " · " +
            ahora.toLocaleTimeString(
                "es-AR",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );
    }


    /* =====================================================
       BOTÓN ACTUALIZAR
       ===================================================== */

    const botonActualizar =
        document.getElementById(
            "reloadNews"
        );


    if (botonActualizar) {

        botonActualizar.addEventListener(
            "click",
            async () => {

                const original =
                    botonActualizar.textContent;

                botonActualizar.disabled =
                    true;

                botonActualizar.textContent =
                    "ACTUALIZANDO...";


                try {

                    await cargarNoticias();

                    botonActualizar.textContent =
                        "ACTUALIZADO ✓";

                } catch (error) {

                    console.error(
                        error
                    );

                    botonActualizar.textContent =
                        "ERROR";

                }


                setTimeout(
                    () => {

                        botonActualizar.textContent =
                            original;

                        botonActualizar.disabled =
                            false;

                    },
                    1800
                );

            }
        );
    }


    /* =====================================================
       NOTIFICACIONES
       ===================================================== */

    window.activarNotificaciones =
        async function() {

            const estado =
                document.getElementById(
                    "notificationStatus"
                ) ||
                document.getElementById(
                    "estadoNotif"
                );


            if (
                !("Notification" in window)
            ) {

                if (estado) {

                    estado.textContent =
                        "Este navegador no permite notificaciones.";

                }

                return;
            }


            try {

                const permiso =
                    await Notification.requestPermission();


                if (estado) {

                    estado.textContent =
                        permiso === "granted"
                        ?
                        "Notificaciones activadas."
                        :
                        "Permiso de notificaciones no concedido.";
                }

            } catch (error) {

                console.error(
                    error
                );

                if (estado) {

                    estado.textContent =
                        "No se pudo activar las notificaciones.";

                }

            }

        };


    /* =====================================================
       SCROLL SUAVE
       ===================================================== */

    document
        .querySelectorAll(
            'a[href^="#"]'
        )
        .forEach(
            enlace => {

                enlace.addEventListener(
                    "click",
                    function(e) {

                        const destino =
                            this.getAttribute(
                                "href"
                            );

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

                            elemento.scrollIntoView(
                                {
                                    behavior:
                                        "smooth",
                                    block:
                                        "start"
                                }
                            );

                        }

                    }
                );

            }
        );


    /* =====================================================
       TICKER
       ===================================================== */

    const ticker =
        document.getElementById(
            "tickerText"
        );


    if (ticker) {

        const mensajes = [

            "Toda la actualidad de Boca en BOCA 24/7.",

            "Noticias, partidos y mercado de pases.",

            "Boca Predio y todas las disciplinas.",

            "Videos, entrevistas y streaming.",

            "Todo Boca. Todo el día."

        ];


        let posicion = 0;


        setInterval(
            () => {

                posicion++;

                if (
                    posicion >=
                    mensajes.length
                ) {

                    posicion = 0;

                }

                ticker.textContent =
                    mensajes[posicion];

            },
            5000
        );
    }


    /* =====================================================
       ANIMACIONES
       ===================================================== */

    function activarAnimaciones() {

        const elementos =
            document.querySelectorAll(
                ".news-card, " +
                ".video, " +
                ".video-card, " +
                ".card, " +
                ".event, " +
                ".photo-card"
            );


        if (
            !(
                "IntersectionObserver"
                in window
            )
        ) {

            elementos.forEach(
                elemento => {

                    elemento.style.opacity =
                        "1";

                    elemento.style.transform =
                        "translateY(0)";

                }
            );

            return;
        }


        const observer =
            new IntersectionObserver(
                entries => {

                    entries.forEach(
                        entry => {

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

                        }
                    );

                },
                {
                    threshold:
                        0.05
                }
            );


        elementos.forEach(
            elemento => {

                elemento.style.opacity =
                    "0";

                elemento.style.transform =
                    "translateY(15px)";

                elemento.style.transition =
                    "opacity .45s ease, transform .45s ease";

                observer.observe(
                    elemento
                );

            }
        );
    }


    /* =====================================================
       INICIAR TODO
       ===================================================== */

    async function iniciarBoca247() {

        console.log(
            "BOCA 24/7 | iniciando..."
        );


        actualizarFecha();


        mostrarEncuestaGuardada();


        await Promise.allSettled([

            cargarNoticias(),

            cargarPartidos(),

            cargarTabla(),

            cargarAgenda(),

            cargarMercado(),

            cargarObras(),

            cargarVideos(),

            cargarDisciplinas(),

            cargarPredio(),

            cargarHistoria(),

            cargarGaleria()

        ]);


        activarAnimaciones();


        actualizarFecha();


        console.log(
            "BOCA 24/7 | aplicación cargada."
        );

    }


    /* =====================================================
       ARRANQUE
       ===================================================== */

    iniciarBoca247();

});
