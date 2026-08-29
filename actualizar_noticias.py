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

    # Decodificar caracteres HTML
    texto = html.unescape(texto)

    # Eliminar etiquetas HTML
    texto = re.sub(
        r"<[^>]+>",
        " ",
        texto
    )

    # Eliminar URLs
    texto = re.sub(
        r"https?://\S+",
        "",
        texto
    )

    # Eliminar espacios repetidos
    texto = re.sub(
        r"\s+",
        " ",
        texto
    )

    return texto.strip()


def crear_resena(entrada):

    # Primero intentamos con summary
    resumen = entrada.get(
        "summary",
        ""
    )

    resumen = limpiar_texto(
        resumen
    )

    # Si el resumen viene vacío,
    # intentamos con description
    if not resumen:

        resumen = entrada.get(
            "description",
            ""
        )

        resumen = limpiar_texto(
            resumen
        )

    # Si todavía no tenemos resumen,
    # usamos un texto neutro.
    if not resumen:

        resumen = (
            "Conocé todos los detalles "
            "de esta noticia de Boca."
        )

    # Evitar reseñas demasiado largas
    if len(resumen) > 300:

        resumen = (
            resumen[:300]
            .rsplit(" ", 1)[0]
            + "..."
        )

    return resumen


def obtener_noticias(
    busqueda,
    categoria
):

    url = (
        "https://news.google.com/rss/search?"
        "q=" + quote(busqueda) +
        "&hl=es-419"
        "&gl=AR"
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

        # Obtener fecha
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

        # Fuente
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

            fuente = (
                "Google Noticias"
            )

        fuente = limpiar_texto(
            fuente
        )

        # Reseña limpia
        contenido = crear_resena(
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
# ELIMINAR NOTICIAS REPETIDAS
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
# MÁXIMO DE NOTICIAS
# =====================================

noticias_finales = (
    noticias_finales[:100]
)


# =====================================
# GUARDAR JSON
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
