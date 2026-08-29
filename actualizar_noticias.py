import json
import re
import html
import feedparser
from datetime import datetime, timezone
from urllib.parse import quote


CATEGORIAS = {

    "Boca": [
        "Boca Juniors fútbol",
        "Boca Juniors noticias"
    ],

    "Sudamericana": [
        "Boca Juniors Copa Sudamericana"
    ],

    "Mercado de pases": [
        "Boca Juniors mercado de pases",
        "Boca Juniors refuerzos"
    ],

    "Lesiones": [
        "Boca Juniors lesiones jugadores"
    ],

    "Básquet": [
        "Boca Juniors básquet"
    ],

    "Futsal": [
        "Boca Juniors futsal"
    ],

    "Reserva": [
        "Boca Juniors Reserva"
    ],

    "Fútbol femenino": [
        "Boca Juniors fútbol femenino",
        "Boca Gladiadoras"
    ],

    "Inferiores": [
        "Boca Juniors inferiores",
        "Boca Juniors juveniles"
    ],

    "Vóley": [
        "Boca Juniors vóley"
    ],

    "La Bombonera": [
        "Boca Juniors La Bombonera",
        "Boca Bombonera obras"
    ]
}


def limpiar_texto(texto):

    if not texto:
        return ""

    texto = html.unescape(texto)

    texto = re.sub(
        r"<[^>]+>",
        " ",
        texto
    )

    texto = re.sub(
        r"https?://\S+",
        "",
        texto
    )

    texto = re.sub(
        r"\s+",
        " ",
        texto
    )

    return texto.strip()


def quitar_fuente_del_final(texto, fuente):

    if not texto:
        return ""

    texto = texto.strip()

    if fuente:

        texto = re.sub(
            r"\s*" +
            re.escape(fuente) +
            r"\s*$",
            "",
            texto,
            flags=re.IGNORECASE
        ).strip()

    return texto


def parece_titulo_repetido(titulo, resumen):

    if not resumen:
        return True

    titulo_limpio = limpiar_texto(
        titulo
    ).lower()

    resumen_limpio = limpiar_texto(
        resumen
    ).lower()

    if not resumen_limpio:
        return True

    # Si el resumen es prácticamente
    # igual al título, no sirve como reseña.

    palabras_titulo = set(
        titulo_limpio.split()
    )

    palabras_resumen = set(
        resumen_limpio.split()
    )

    if not palabras_titulo:
        return True

    coincidencias = (
        len(
            palabras_titulo
            .intersection(
                palabras_resumen
            )
        )
        /
        len(palabras_titulo)
    )

    if coincidencias >= 0.80:
        return True

    if len(resumen_limpio) < 70:
        return True

    return False


def crear_resena(
    titulo,
    categoria,
    fuente,
    entrada
):

    resumen = entrada.get(
        "summary",
        ""
    )

    resumen = limpiar_texto(
        resumen
    )

    resumen = quitar_fuente_del_final(
        resumen,
        fuente
    )

    if not parece_titulo_repetido(
        titulo,
        resumen
    ):

        if len(resumen) > 320:

            resumen = (
                resumen[:320]
                .rsplit(" ", 1)[0]
                + "..."
            )

        return resumen


    # =================================
    # RESEÑA DE RESPALDO
    # =================================

    textos = {

        "Boca":
            "Todas las novedades de Boca Juniors, "
            "la actualidad del plantel y la información "
            "más importante del mundo Xeneize.",

        "Sudamericana":
            "Toda la información de Boca Juniors "
            "en la Copa Sudamericana, con las últimas "
            "novedades, partidos y protagonistas.",

        "Mercado de pases":
            "Las últimas novedades del mercado de pases "
            "de Boca Juniors: refuerzos, negociaciones, "
            "altas y bajas.",

        "Lesiones":
            "Últimas novedades sobre el estado físico "
            "de los jugadores de Boca Juniors y sus "
            "respectivas recuperaciones.",

        "Básquet":
            "Toda la actualidad del básquet de Boca "
            "Juniors, sus partidos, resultados y "
            "protagonistas.",

        "Futsal":
            "Las últimas noticias del futsal de Boca "
            "Juniors, partidos, resultados y novedades "
            "del equipo.",

        "Reserva":
            "Toda la información de la Reserva de Boca "
            "Juniors y las futuras figuras del club.",

        "Fútbol femenino":
            "Las últimas novedades del fútbol femenino "
            "de Boca Juniors y Las Gladiadoras.",

        "Inferiores":
            "Toda la actualidad de las divisiones "
            "juveniles e inferiores de Boca Juniors.",

        "Vóley":
            "Noticias y novedades del vóley de Boca "
            "Juniors.",

        "La Bombonera":
            "Toda la información sobre La Bombonera, "
            "sus novedades, obras y actualidad."
    }


    return textos.get(
        categoria,
        "Últimas novedades de Boca Juniors. "
        "Entrá a la nota para conocer todos los detalles."
    )


def obtener_noticias(
    busqueda,
    categoria
):

    url = (
        "https://news.google.com/rss/search?"
        "q=" +
        quote(busqueda) +
        "&hl=es-419" +
        "&gl=AR" +
        "&ceid=AR:es-419"
    )

    feed = feedparser.parse(
        url
    )

    resultados = []


    for entrada in feed.entries[:15]:

        titulo = limpiar_texto(
            entrada.get(
                "title",
                ""
            )
        )

        link = entrada.get(
            "link",
            ""
        ).strip()

        if not titulo:
            continue


        # =================================
        # FUENTE
        # =================================

        fuente = ""

        source = entrada.get(
            "source"
        )

        if source:

            try:

                fuente = source.get(
                    "title",
                    ""
                )

            except Exception:

                fuente = ""

        if not fuente:

            fuente = "Google Noticias"

        fuente = limpiar_texto(
            fuente
        )


        # =================================
        # FECHA
        # =================================

        fecha_iso = ""

        publicado = entrada.get(
            "published_parsed"
        )

        if publicado:

            try:

                fecha = datetime(
                    *publicado[:6],
                    tzinfo=timezone.utc
                )

                fecha_iso = (
                    fecha.isoformat()
                )

            except Exception:

                fecha_iso = ""


        # =================================
        # RESEÑA
        # =================================

        contenido = crear_resena(
            titulo,
            categoria,
            fuente,
            entrada
        )


        resultados.append({

            "titulo": titulo,

            "fuente": fuente,

            "contenido": contenido,

            "link": link,

            "categoria": categoria,

            "fecha_iso": fecha_iso

        })


    return resultados


# =====================================
# OBTENER TODAS LAS NOTICIAS
# =====================================

todas = []


for categoria, busquedas in CATEGORIAS.items():

    for busqueda in busquedas:

        try:

            noticias = obtener_noticias(
                busqueda,
                categoria
            )

            todas.extend(
                noticias
            )

        except Exception as error:

            print(
                "Error en "
                + categoria
                + ": "
                + str(error)
            )


# =====================================
# ELIMINAR REPETIDAS
# =====================================

unicas = {}


for noticia in todas:

    titulo = (
        noticia
        .get("titulo", "")
        .lower()
        .strip()
    )

    if not titulo:
        continue

    if titulo not in unicas:

        unicas[titulo] = noticia


noticias_finales = list(
    unicas.values()
)


# =====================================
# ORDENAR POR FECHA
# =====================================

noticias_finales.sort(

    key=lambda noticia:
        noticia.get(
            "fecha_iso",
            ""
        ),

    reverse=True

)


# =====================================
# MÁXIMO 100 NOTICIAS
# =====================================

noticias_finales = (
    noticias_finales[:100]
)


# =====================================
# GUARDAR
# =====================================

with open(
    "noticias.json",
    "w",
    encoding="utf-8"
) as archivo:

    json.dump(
        noticias_finales,
        archivo,
        ensure_ascii=False,
        indent=2
    )


print(
    "================================="
)

print(
    "Noticias actualizadas: "
    + str(
        len(noticias_finales)
    )
)

print(
    "================================="
)

print(
    "Categorías encontradas:"
)


categorias_encontradas = sorted(
    set(
        noticia.get(
            "categoria",
            ""
        )
        for noticia in noticias_finales
    )
)


for categoria in categorias_encontradas:

    print(
        "- "
        + categoria
    )


print(
    "================================="
    )
