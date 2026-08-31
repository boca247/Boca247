/* =========================================================
   BOCA 24/7 - APP.JS
   Funciones principales de la página
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    /* =====================================================
       ENCUESTA - OPINIÓN DEL HINCHA
       ===================================================== */

    window.vote = function (opcion) {

        const resultado = document.getElementById("pollResult");

        if (!resultado) return;

        const votos = JSON.parse(
            localStorage.getItem("boca247_encuesta") || "{}"
        );

        votos[opcion] = (votos[opcion] || 0) + 1;

        localStorage.setItem(
            "boca247_encuesta",
            JSON.stringify(votos)
        );

        const total = Object.values(votos).reduce(
            (a, b) => a + b,
            0
        );

        resultado.innerHTML = `
            <strong>Gracias por votar.</strong><br>
            Tu respuesta fue: <strong>${opcion}</strong><br><br>
            <span>Total de votos: ${total}</span>
        `;

        mostrarResultadosEncuesta();
    };


    function mostrarResultadosEncuesta() {

        const resultado = document.getElementById("pollResult");

        if (!resultado) return;

        const votos = JSON.parse(
            localStorage.getItem("boca247_encuesta") || "{}"
        );

        const opciones = [
            "Muy bien",
            "Bien",
            "Regular",
            "Mal"
        ];

        const total = opciones.reduce(
            (suma, opcion) => suma + (votos[opcion] || 0),
            0
        );

        if (total === 0) {
            resultado.textContent = "Elegí una opción.";
            return;
        }

        let html = `
            <strong>Resultados de la encuesta</strong>
            <div style="margin-top:12px;">
        `;

        opciones.forEach(function (opcion) {

            const cantidad = votos[opcion] || 0;

            const porcentaje = Math.round(
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
                        <span>${opcion}</span>
                        <span>${porcentaje}%</span>
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
       BOTÓN ACTUALIZAR NOTICIAS
       ===================================================== */

    const reloadNews = document.getElementById("reloadNews");

    if (reloadNews) {

        reloadNews.addEventListener("click", function () {

            const textoOriginal = reloadNews.textContent;

            reloadNews.textContent = "ACTUALIZANDO...";

            reloadNews.disabled = true;

            setTimeout(function () {

                reloadNews.textContent = "ACTUALIZADO ✓";

                setTimeout(function () {

                    reloadNews.textContent = textoOriginal;
                    reloadNews.disabled = false;

                }, 1500);

            }, 700);

        });
    }


    /* =====================================================
       BOTÓN VER MÁS NOTICIAS
       ===================================================== */

    const loadMore = document.getElementById("loadMore");

    if (loadMore) {

        loadMore.addEventListener("click", function () {

            const newsGrid = document.getElementById("newsGrid");

            if (!newsGrid) return;

            const noticiasExtra = [

                {
                    categoria: "FÚTBOL",
                    titulo: "Toda la actualidad del plantel Xeneize",
                    texto: "Las últimas novedades de Boca y sus protagonistas.",
                    fecha: "ACTUALIDAD"
                },

                {
                    categoria: "BOCA PREDIO",
                    titulo: "Las inferiores continúan trabajando",
                    texto: "Toda la información de las divisiones juveniles.",
                    fecha: "BOCA PREDIO"
                },

                {
                    categoria: "CLUB",
                    titulo: "Información institucional de Boca Juniors",
                    texto: "Las principales novedades del Club Atlético Boca Juniors.",
                    fecha: "INSTITUCIONAL"
                }
            ];

            noticiasExtra.forEach(function (noticia) {

                const article = document.createElement("article");

                article.className = "news-card";

                article.innerHTML = `
                    <div class="news-image image-team">
                        <span>BOCA</span>
                    </div>

                    <div class="news-content">

                        <span class="category">
                            ${noticia.categoria}
                        </span>

                        <h3>
                            ${noticia.titulo}
                        </h3>

                        <p>
                            ${noticia.texto}
                        </p>

                        <span class="news-date">
                            ${noticia.fecha}
                        </span>

                    </div>
                `;

                newsGrid.appendChild(article);

            });

            loadMore.textContent = "NOTICIAS CARGADAS ✓";

            loadMore.disabled = true;

        });
    }


    /* =====================================================
       TICKER
       ===================================================== */

    const ticker = document.getElementById("tickerText");

    if (ticker) {

        const mensajes = [
            "Toda la actualidad de Boca en BOCA 24/7.",
            "Información del plantel y todas las disciplinas.",
            "Noticias, partidos, mercado y comunidad Xeneize.",
            "Todo Boca. Todo el día."
        ];

        let posicion = 0;

        setInterval(function () {

            posicion++;

            if (posicion >= mensajes.length) {
                posicion = 0;
            }

            ticker.textContent = mensajes[posicion];

        }, 5000);
    }


    /* =====================================================
       SCROLL SUAVE
       ===================================================== */

    document.querySelectorAll('a[href^="#"]').forEach(function (enlace) {

        enlace.addEventListener("click", function (e) {

            const destino = this.getAttribute("href");

            if (!destino || destino === "#") return;

            const elemento = document.querySelector(destino);

            if (elemento) {

                e.preventDefault();

                elemento.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        });

    });


    /* =====================================================
       ANIMACIÓN AL APARECER
       ===================================================== */

    const elementos = document.querySelectorAll(
        ".news-card, .video-card, .market-card, .fixture, .photo-card, .fan-card, .poll-card"
    );

    const observer = new IntersectionObserver(
        function (entries) {

            entries.forEach(function (entry) {

                if (entry.isIntersecting) {

                    entry.target.style.opacity = "1";
                    entry.target.style.transform = "translateY(0)";

                }

            });

        },
        {
            threshold: 0.08
        }
    );


    elementos.forEach(function (elemento) {

        elemento.style.opacity = "0";
        elemento.style.transform = "translateY(15px)";
        elemento.style.transition =
            "opacity .5s ease, transform .5s ease";

        observer.observe(elemento);

    });


    /* =====================================================
       CARGAR RESULTADOS GUARDADOS
       ===================================================== */

    mostrarResultadosEncuesta();


    /* =====================================================
       MENSAJE DE INICIO
       ===================================================== */

    console.log(
        "BOCA 24/7 cargado correctamente."
    );

});
