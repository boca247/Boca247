import json
import re
import feedparser
from datetime import datetime

ARCHIVO = "noticias.json"

FUENTES = [
    ("Boca Oficial", "https://news.google.com/rss/search?q=site%3Abocajuniors.com.ar+Boca+Juniors&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Sudamericana", "https://news.google.com/rss/search?q=Boca+Juniors+Sudamericana&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Fútbol", "https://news.google.com/rss/search?q=Boca+Juniors+futbol&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Lesiones", "https://news.google.com/rss/search?q=Boca+Juniors+lesion&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Mercado de pases", "https://news.google.com/rss/search?q=Boca+Juniors+mercado+de+pases&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Reserva", "https://news.google.com/rss/search?q=Boca+Juniors+Reserva&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Básquet", "https://news.google.com/rss/search?q=Boca+Juniors+basquet&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Futsal", "https://news.google.com/rss/search?q=Boca+Juniors+futsal&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Fútbol femenino", "https://news.google.com/rss/search?q=Boca+Juniors+futbol+femenino&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Boca - Obras", "https://news.google.com/rss/search?q=Boca+Juniors+obras+Bombonera&hl=es-419&gl=AR&ceid=AR%3Aes-419"),

    ("Tato Aguilera", "https://news.google.com/rss/search?q=%22Tato+Aguilera%22+Boca&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Diego Monroig", "https://news.google.com/rss/search?q=%22Diego+Monroig%22+Boca&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Augusto César", "https://news.google.com/rss/search?q=%22Augusto+C%C3%A9sar%22+Boca&hl=es-419&gl=AR&ceid=AR%3Aes-419"),
    ("Canal de Boca", "https://news.google.com/rss/search?q=%22El+Canal+de+Boca%22&hl=es-419&gl=AR&ceid=AR%3Aes-419")
]


def limpiar(texto):
    texto = re.sub(r"<[^>]*>", "", texto or "")
    texto = re.sub(r"\s+", " ", texto)
    return texto.strip()


def categoria(titulo, fuente):
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

    if any(x in t for x in [
        "obra", "obras", "bombonera",
        "infraestructura", "estadio"
    ]):
        return "Obras"

    if any(x in t for x in [
        "lesión", "lesionado", "lesion",
        "fractura", "operado", "recuperación"
    ]):
        return "Lesiones"

    if any(x in t for x in [
        "mercado", "refuerzo", "incorporación",
        "pase", "fichaje"
    ]):
        return "Mercado de pases"

    if "inferiores" in t or "juvenil" in t or "quinta" in t or "sexta" in t:
        return "Inferiores"

    if "partido" in t or "vs." in t or "vs " in t:
        return "Partidos"

    if fuente in [
        "Tato Aguilera",
        "Diego Monroig",
        "Augusto César"
    ]:
        return fuente

    if fuente == "Canal de Boca":
        return "Canal de Boca"

    return "Boca"


def obtener_noticias():
    noticias = []

    for fuente, url in FUENTES:

        print("Consultando:", fuente)

        try:
            feed = feedparser.parse(url)

            for item in feed.entries[:15]:

                titulo = limpiar(item.get("title", ""))

                if not titulo:
                    continue

                link = item.get("link", "")

                resumen = limpiar(
                    item.get("summary", "")
                )

                if not resumen:
                    resumen = (
                        "Últimas novedades de Boca Juniors."
                    )

                fecha = item.get(
                    "published",
                    datetime.now().strftime("%d/%m/%Y")
                )

                noticia = {
                    "titulo": titulo,
                    "fuente": fuente,
                    "fecha": fecha,
                    "categoria": categoria(
                        titulo,
                        fuente
                    ),
                    "contenido": resumen[:600],
                    "link": link
                }

                noticias.append(noticia)

        except Exception as error:
            print(
                "Error consultando",
                fuente,
                ":",
                error
            )

    return noticias


def cargar_existentes():

    try:
        with open(
            ARCHIVO,
            "r",
            encoding="utf-8"
        ) as f:
            return json.load(f)

    except Exception:
        return []


def guardar(noticias):

    with open(
        ARCHIVO,
        "w",
        encoding="utf-8"
    ) as f:

        json.dump(
            noticias,
            f,
            ensure_ascii=False,
            indent=2
        )


nuevas = obtener_noticias()
anteriores = cargar_existentes()

# Las nuevas primero
todas = nuevas + anteriores

# Eliminar duplicados
unicas = {}

for noticia in todas:

    clave = (
        noticia["titulo"]
        .lower()
        .strip()
    )

    if clave not in unicas:
        unicas[clave] = noticia

# Ordenar: las nuevas quedan primero
resultado = list(unicas.values())

# Mantener máximo 150
resultado = resultado[:150]

guardar(resultado)

print(
    "================================="
)

print(
    "ACTUALIZACION COMPLETADA"
)

print(
    "Noticias nuevas:",
    len(nuevas)
)

print(
    "Noticias totales:",
    len(resultado)
)

print(
    "================================="
)
