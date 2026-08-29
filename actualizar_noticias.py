  import json
import feedparser
from datetime import datetime, timezone, timedelta


FUENTES = [
    {
        "nombre": "TyC Sports",
        "rss": "https://www.tycsports.com/rss/pages/boca-juniors.xml"
    },
    {
        "nombre": "Google Noticias Boca",
        "rss": "https://news.google.com/rss/search?q=Boca+Juniors&hl=es-419&gl=AR&ceid=AR:es-419"
    }
]


def hora_argentina(fecha):

    argentina = timezone(
        timedelta(hours=-3)
    )

    fecha_argentina = fecha.astimezone(
        argentina
    )

    return fecha_argentina.strftime(
        "%d/%m/%Y %H:%M"
    )


def procesar_fuente(fuente):

    noticias = []

    try:

        feed = feedparser.parse(
            fuente["rss"]
        )

        for entrada in feed.entries[:15]:

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
            )

            resumen = resumen.replace(
                "<p>",
                ""
            ).replace(
                "</p>",
                ""
            ).strip()

            if not titulo:
                continue

            fecha = None

            if hasattr(
                entrada,
                "published_parsed"
            ):

                fecha = datetime(
                    *entrada.published_parsed[:6],
                    tzinfo=timezone.utc
                )

            elif hasattr(
                entrada,
                "updated_parsed"
            ):

                fecha = datetime(
                    *entrada.updated_parsed[:6],
                    tzinfo=timezone.utc
                )

            if fecha is None:

                fecha = datetime.now(
                    timezone.utc
                )

            fecha_arg = hora_argentina(
                fecha
            )

            categoria = "Boca"

            titulo_lower = titulo.lower()

            if "sudamericana" in titulo_lower:

                categoria = "Sudamericana"

            elif "mercado" in titulo_lower:

                categoria = "Mercado de pases"

            elif "lesion" in titulo_lower:

                categoria = "Lesiones"

            elif "basquet" in titulo_lower:

                categoria = "Básquet"

            elif "futsal" in titulo_lower:

                categoria = "Futsal"

            elif "femenino" in titulo_lower:

                categoria = "Fútbol femenino"

            noticias.append({

                "titulo": titulo,

                "fuente": fuente["nombre"],

                "contenido": resumen,

                "link": link,

                "fecha": fecha_arg,

                "hora": fecha_arg[-5:],

                "fecha_iso": fecha.isoformat(),

                "categoria": categoria

            })

    except Exception as error:

        print(
            "Error en",
            fuente["nombre"],
            ":",
            error
        )

    return noticias


def actualizar():

    todas = []

    for fuente in FUENTES:

        noticias = procesar_fuente(
            fuente
        )

        todas.extend(
            noticias
        )

    vistas = set()

    noticias_finales = []

    for noticia in todas:

        clave = (
            noticia["titulo"]
            .lower()
            .strip()
        )

        if clave in vistas:
            continue

        vistas.add(
            clave
        )

        noticias_finales.append(
            noticia
        )

    noticias_finales.sort(
        key=lambda noticia:
        noticia["fecha_iso"],
        reverse=True
    )

    noticias_finales = (
        noticias_finales[:40]
    )

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


if __name__ == "__main__":

    actualizar()
