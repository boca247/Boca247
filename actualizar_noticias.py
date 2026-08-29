import json
import re
import time
import feedparser
from datetime import datetime

ARCHIVO = "noticias.json"

FUENTES = [
    {
        "nombre": "Boca Juniors Oficial",
        "url": "https://www.bocajuniors.com.ar/noticias"
    },
    {
        "nombre": "Google Noticias Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Sudamericana Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+Sudamericana&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Básquet Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+basquet&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Futsal Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+futsal&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Fútbol Femenino Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+futbol+femenino&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Reserva Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+Reserva&hl=es-419&gl=AR&ceid=AR:es-419"
    },
    {
        "nombre": "Google Noticias Obras Boca",
        "url": "https://news.google.com/rss/search?q=Boca+Juniors+obras+Bombonera&hl=es-419&gl=AR&ceid=AR:es-419"
    }
]


def categoria(titulo):

    t = titulo.lower()

    if "sudamericana" in t:
        return "Sudamericana"

    if "básquet" in t or "basquet" in t:
        return "Básquet"

    if "futsal" in t:
        return "Futsal"

    if "femenino" in t or "gladiadoras" in t:
        return "Fútbol femenino"

    if "reserva" in t:
        return "Reserva"

    if "obra" in t or "bombonera" in t or "infraestructura" in t:
        return "Obras"

    if "lesión" in t or "lesionado" in t or "fractura" in t:
        return "Lesiones"

    if "mercado" in t or "refuerzo" in t or "fichaje" in t:
        return "Mercado de pases"

    if "partido" in t or "vs" in t or "contra" in t:
        return "Partidos"

    return "Boca"


def limpiar(texto):

    texto = re.sub("<[^>]+>", "", texto or "")
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def fecha_actual():

    return datetime.now().strftime("%d de %B de %Y")


noticias_nuevas = []


for fuente in FUENTES:

    try:

        feed = feedparser.parse(fuente["url"])

        for item in feed.entries[:10]:

            titulo = limpiar(
                item.get("title", "")
            )

            if not titulo:
                continue

            link = item.get("link", "")

            resumen = limpiar(
                item.get(
                    "summary",
                    item.get("description", "")
                )
            )

            noticia = {
                "titulo": titulo,
                "fuente": fuente["nombre"],
                "fecha": fecha_actual(),
                "categoria": categoria(titulo),
                "contenido": resumen[:500],
                "link": link
            }

            noticias_nuevas.append(noticia)

    except Exception as error:

        print(
            "Error con",
            fuente["nombre"],
            error
        )


# Eliminar duplicados

unicas = {}

for noticia in noticias_nuevas:

    clave = noticia["titulo"].lower().strip()

    if clave not in unicas:
        unicas[clave] = noticia


noticias_nuevas = list(unicas.values())


# Leer noticias existentes

try:

    with open(
        ARCHIVO,
        "r",
        encoding="utf-8"
    ) as archivo:

        antiguas = json.load(archivo)

except Exception:

    antiguas = []


# Mantener noticias anteriores

todas = noticias_nuevas + antiguas


# Eliminar duplicados nuevamente

resultado = {}

for noticia in todas:

    clave = noticia["titulo"].lower().strip()

    if clave not in resultado:
        resultado[clave] = noticia


noticias_finales = list(resultado.values())


# Limitar archivo para que no crezca indefinidamente

noticias_finales = noticias_finales[:100]


with open(
    ARCHIVO,
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
