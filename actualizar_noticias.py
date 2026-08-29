import json
import feedparser
import re
import html
from datetime import datetime, timezone, timedelta
from email.utils import parsedate_to_datetime


FUENTES = [
    {
        "nombre": "Google Noticias",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "TyC Sports",
        "url": "https://www.tycsports.com/rss/pages/boca-juniors.xml"
    }
]


def limpiar(texto):
    if not texto:
        return ""

    texto = html.unescape(str(texto))
    texto = re.sub(r"<[^>]*>", " ", texto)
    texto = re.sub(r"\s+", " ", texto).strip()

    arreglos = {
        "Ã¡": "á",
        "Ã©": "é",
        "Ã­": "í",
        "Ã³": "ó",
        "Ãº": "ú",
        "Ã±": "ñ",
        "Ã": "Á",
        "Ã‰": "É",
        "Ã": "Í",
        "Ã“": "Ó",
        "Ãš": "Ú",
        "Ã‘": "Ñ",
        "Â¿": "¿",
        "Â¡": "¡",
        "Â": "",
        "â": "'",
        "â": "-",
        "â": "-",
        "â¦": "..."
    }

    for viejo, nuevo in arreglos.items():
        texto = texto.replace(viejo, nuevo)

    return texto


def obtener_fecha(entrada):

    fecha = None

    try:
        if getattr(entrada, "published", ""):
            fecha = parsedate_to_datetime(
                entrada.published
            )
    except Exception:
        pass

    if fecha is None:
        try:
            if getattr(entrada, "updated", ""):
                fecha = parsedate_to_datetime(
                    entrada.updated
                )
        except Exception:
            pass

    if fecha is None:
        fecha = datetime.now(timezone.utc)

    if fecha.tzinfo is None:
        fecha = fecha.replace(
            tzinfo=timezone.utc
        )

    return fecha


def categoria(titulo):

    t = titulo.lower()

    if "sudamericana" in t:
        return "Sudamericana"

    if any(x in t for x in [
        "mercado",
        "refuerzo",
        "refuerzos",
        "incorporación",
        "incorporacion"
    ]):
        return "Mercado de pases"

    if any(x in t for x in [
        "lesión",
        "lesion",
        "desgarro",
        "molestia"
    ]):
        return "Lesiones"

    if "básquet" in t or "basquet" in t:
        return "Básquet"

    if "futsal" in t:
        return "Futsal"

    if "femenino" in t:
        return "Fútbol femenino"

    if "bombonera" in t:
        return "La Bombonera"

    if "reserva" in t:
        return "Reserva"

    if "inferiores" in t:
        return "Inferiores"

    return "Boca"


def leer_fuente(fuente):

    noticias = []

    try:

        feed = feedparser.parse(
            fuente["url"]
        )

        for entrada in feed.entries[:25]:

            titulo = limpiar(
                entrada.get("title", "")
            )

            if not titulo:
                continue

            contenido = limpiar(
                entrada.get(
                    "summary",
                    entrada.get(
                        "description",
                        ""
                    )
                )
            )

            link = entrada.get(
                "link",
                ""
            )

            fecha = obtener_fecha(
                entrada
            )

            argentina = timezone(
                timedelta(hours=-3)
            )

            fecha_ar = fecha.astimezone(
                argentina
            )

            noticias.append({
                "titulo": titulo,
                "fuente": fuente["nombre"],
                "contenido": contenido,
                "link": link,
                "fecha": fecha_ar.strftime(
                    "%d/%m/%Y"
                ),
                "hora": fecha_ar.strftime(
                    "%H:%M"
                ),
                "fecha_iso": fecha_ar.isoformat(),
                "categoria": categoria(
                    titulo
                )
            })

    except Exception as error:

        print(
            "Error:",
            fuente["nombre"],
            error
        )

    return noticias


def actualizar():

    todas = []

    for fuente in FUENTES:

        todas.extend(
            leer_fuente(fuente)
        )

    unicas = {}
    ahora = datetime.now(
        timezone.utc
    )

    for noticia in todas:

        clave = noticia[
            "titulo"
        ].lower().strip()

        if clave not in unicas:
            unicas[clave] = noticia

    noticias = list(
        unicas.values()
    )

    noticias.sort(
        key=lambda x:
        x["fecha_iso"],
        reverse=True
    )

    noticias = noticias[:50]

    with open(
        "noticias.json",
        "w",
        encoding="utf-8",
        newline="\n"
    ) as archivo:

        json.dump(
            noticias,
            archivo,
            ensure_ascii=False,
            indent=2
        )

    print(
        "Noticias guardadas:",
        len(noticias)
    )


if __name__ == "__main__":
    actualizar()
