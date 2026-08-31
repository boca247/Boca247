import json
import re
import html
import feedparser
from datetime import datetime, timezone
from urllib.parse import quote


CATEGORIAS = {

    "Boca": [
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
        "Boca Juniors lesiones"
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
        "Boca Juniors fútbol femenino"
    ],

    "Inferiores": [
        "Boca Juniors inferiores"
    ],

    "Vóley": [
        "Boca Juniors vóley"
    ],

    "La Bombonera": [
        "Boca Juniors La Bombonera"
    ]
}


def limpiar_texto(texto):

    if not texto:
        return ""

    texto = html.unescape(str(texto))

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


def quitar_fuente_del_titulo(titulo):

    titulo = limpiar_texto(titulo)

    # Google News suele agregar:
    # " - Nombre del medio"

    titulo = re.sub(
        r"\s+-\s+[^-]+$",
        "",
        titulo
    )

    return titulo.strip()


def clave_noticia(titulo):

    titulo = quitar_fuente_del_titulo(
        titulo
    )

    titulo = titulo.lower()

    reemplazos = {
        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u"
    }

    for viejo, nuevo in reemplazos.items():

        titulo = titulo.replace(
            viejo,
            nuevo
        )

    titulo = re.sub(
        r"[^a-z0-9\s]",
        " ",
        titulo
    )

    titulo = re.sub(
        r"\s+",
        " ",
        titulo
    )

    return titulo.strip()


def parece_titulo_repetido(
    titulo,
    resumen
):

    if not resumen:
        return True

    titulo_limpio =
        limpiar_texto(titulo).lower()

    resumen_limpio =
        limpiar_texto(resumen).lower()

    if not resumen_limpio:
        return True

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
            palabras_titulo.intersection(
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

    if fuente:

        resumen = re.sub(
            r"\s*" +
            re.escape(fuente) +
            r"\s*$",
            "",
            resumen,
            flags=re.IGNORECASE
        ).strip()

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
            "de los jugadores de Boca Juniors.",

        "Básquet":
            "Toda la actualidad del básquet de Boca "
            "Juniors, sus partidos, resultados y "
            "protagonistas.",

        "Futsal":
            "Las últimas noticias del futsal de Boca "
            "Juniors, partidos, resultados y novedades.",

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
        "&hl=es-419"
        "&gl=AR"
        "&ceid=AR:es-419"
    )

    feed = feedparser.parse(url)

    resultados = []

    for entrada in feed.entries[:10]:

        titulo_original = limpiar_texto(
            entrada.get(
                "title",
                ""
            )
        )

        if not titulo_original:
            continue

        titulo = quitar_fuente_del_titulo(
            titulo_original
        )

        link = entrada.get(
            "link",
            ""
        ).strip()

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
# OBTENER NOTICIAS
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
# ELIMINAR DUPLICADOS
# =====================================

unicas = {}

for noticia in todas:

    clave = clave_noticia(
        noticia.get(
            "titulo",
            ""
        )
    )

    if not clave:
        continue

    if clave not in unicas:

        unicas[clave] = noticia


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
# MÁXIMO 60
# =====================================

noticias_finales = (
    noticias_finales[:60]
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
    "BOCA 24/7"
)

print(
    "Noticias únicas: "
    + str(
        len(noticias_finales)
    )
)

print(
    "================================="
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
        "- " + categoria
    )

print(
    "================================="
    )
