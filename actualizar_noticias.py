import json
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


def obtener_noticias(busqueda, categoria):

    url = (
        "https://news.google.com/rss/search?"
        "q=" + quote(busqueda) +
        "&hl=es-419"
        "&gl=AR"
        "&ceid=AR:es-419"
    )

    feed = feedparser.parse(url)

    resultados = []

    for entrada in feed.entries[:10]:

        titulo = entrada.get(
            "title",
            ""
        ).strip()

        link = entrada.get(
            "link",
            ""
        ).strip()

        resumen = entrada.get(
            "summary",
            ""
        ).strip()

        publicado = entrada.get(
            "published_parsed"
        )

        fecha_iso = ""

        if publicado:

            try:

                fecha = datetime(
                    *publicado[:6],
                    tzinfo=timezone.utc
                )

                fecha_iso = fecha.isoformat()

            except Exception:

                fecha_iso = ""

        fuente = ""

        if hasattr(
            entrada,
            "source"
        ):

            fuente = entrada.source.get(
                "title",
                ""
            )

        if not fuente:

            fuente = "Google Noticias"

        if not titulo:

            continue

        resultados.append({

            "titulo": titulo,

            "fuente": fuente,

            "contenido": resumen,

            "link": link,

            "categoria": categoria,

            "fecha_iso": fecha_iso

        })

    return resultados


def limpiar_html(texto):

    reemplazos = {

        "<br>": " ",
        "<br/>": " ",
        "<br />": " ",
        "<p>": " ",
        "</p>": " "

    }

    for viejo, nuevo in reemplazos.items():

        texto = texto.replace(
            viejo,
            nuevo
        )

    return texto.strip()


todas = []


for categoria, busquedas in CATEGORIAS.items():

    for busqueda in busquedas:

        try:

            noticias = obtener_noticias(
                busqueda,
                categoria
            )

            for noticia in noticias:

                noticia["contenido"] = limpiar_html(
                    noticia["contenido"]
                )

                todas.append(noticia)

        except Exception as error:

            print(
                "Error en",
                categoria,
                ":",
                error
            )


# Eliminar noticias repetidas
# usando el título como referencia.

unicas = {}

for noticia in todas:

    clave = (
        noticia["titulo"]
        .lower()
        .strip()
    )

    if clave not in unicas:

        unicas[clave] = noticia


noticias_finales = list(
    unicas.values()
)


# Ordenar de más nueva a más vieja.

noticias_finales.sort(
    key=lambda noticia:
        noticia.get(
            "fecha_iso",
            ""
        ),
    reverse=True
)


# Limitar cantidad para que
# la página no se vuelva interminable.

noticias_finales = noticias_finales[:100]


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
    "Noticias actualizadas:",
    len(noticias_finales)
)

print(
    "Categorías:",
    sorted(
        set(
            noticia["categoria"]
            for noticia in noticias_finales
        )
    )
)
