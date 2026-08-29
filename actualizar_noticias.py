import json
import re
import html
import feedparser
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

ARGENTINA = timezone(timedelta(hours=-3))


def limpiar(texto):
    if not texto:
        return ""

    texto = html.unescape(str(texto))
    texto = re.sub(r"<[^>]+>", " ", texto)

    correcciones = {
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
        "â¦": "...",
        "â": '"',
        "â": '"'
    }

    for malo, bueno in correcciones.items():
        texto = texto.replace(malo, bueno)

    texto = re.sub(r"\s+", " ", texto)

    return texto.strip()


def obtener_fecha(entrada):

    fecha = None

    try:
        publicada = entrada.get("published", "")

        if publicada:
            fecha = parsedate_to_datetime(publicada)

    except Exception:
        pass

    if fecha is None:

        try:
            actualizada = entrada.get("updated", "")

            if actualizada:
                fecha = parsedate_to_datetime(actualizada)

        except Exception:
            pass

    if fecha is None:

        try:
            if entrada.get("published_parsed"):
                fecha = datetime(
                    *entrada.published_parsed[:6],
                    tzinfo=timezone.utc
                )
        except Exception:
            pass

    if fecha is None:
        fecha = datetime.now(timezone.utc)

    if fecha.tzinfo is None:
        fecha = fecha.replace(tzinfo=timezone.utc)

    return fecha


def obtener_categoria(titulo):

    texto = titulo.lower()

    if "sudamericana" in texto:
        return "Sudamericana"

    if any(palabra in texto for palabra in [
        "mercado",
        "refuerzo",
        "refuerzos",
        "incorporación",
        "incorporacion",
        "fichaje"
    ]):
        return "Mercado de pases"

    if any(palabra in texto for palabra in [
        "lesión",
        "lesion",
        "desgarro",
        "molestia"
    ]):
        return "Lesiones"

    if "básquet" in texto or "basquet" in texto:
        return "Básquet"

    if "futsal" in texto:
        return "Futsal"

    if "femenino" in texto:
        return "Fútbol femenino"

    if "bombonera" in texto:
        return "La Bombonera"

    if "reserva" in texto:
        return "Reserva"

    if "inferiores" in texto:
        return "Inferiores"

    return "Boca"


def leer_fuente(fuente):

    noticias = []

    print("Leyendo:", fuente["nombre"])

    try:

        feed = feedparser.parse(fuente["url"])

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
            ).strip()

            fecha = obtener_fecha(entrada)

            fecha_argentina = fecha.astimezone(ARGENTINA)

            noticias.append({
                "titulo": titulo,
                "fuente": limpiar(fuente["nombre"]),
                "contenido": contenido,
                "link": link,
                "fecha": fecha_argentina.strftime("%d/%m/%Y"),
                "hora": fecha_argentina.strftime("%H:%M"),
                "fecha_iso": fecha_argentina.isoformat(),
                "categoria": obtener_categoria(titulo)
            })

    except Exception as error:

        print(
            "Error leyendo",
            fuente["nombre"],
            ":",
            error
        )

    return noticias


def actualizar():

    todas = []

    for fuente in FUENTES:

        noticias = leer_fuente(fuente)

        todas.extend(noticias)

    unicas = {}

    for noticia in todas:

        clave = noticia["titulo"].lower().strip()

        if clave not in unicas:
            unicas[clave] = noticia

    noticias = list(unicas.values())

    noticias.sort(
        key=lambda noticia: noticia["fecha_iso"],
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
        "Noticias actualizadas:",
        len(noticias)
    )


if __name__ == "__main__":
    actualizar()
