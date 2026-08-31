import json
import re
import html
import feedparser

from datetime import datetime, timezone
from urllib.parse import quote


# ============================================================
# CONFIGURACIÓN DE BÚSQUEDAS
# ============================================================

CATEGORIAS = {

    "Boca": [
        "Boca Juniors"
    ],

    "Sudamericana": [
        "Boca Juniors Copa Sudamericana"
    ],

    "Mercado de pases": [
        "Boca Juniors mercado de pases"
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
        "Boca Juniors Bombonera"
    ]
}


# ============================================================
# CANTIDAD MÁXIMA
# ============================================================

MAX_NOTICIAS_POR_BUSQUEDA = 20

MAX_NOTICIAS_FINALES = 80


# ============================================================
# LIMPIAR TEXTO
# ============================================================

def limpiar_texto(texto):

    if not texto:
        return ""

    texto = html.unescape(
        str(texto)
    )

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


# ============================================================
# NORMALIZAR TEXTO PARA COMPARAR
# ============================================================

def normalizar_texto(texto):

    texto = limpiar_texto(
        texto
    ).lower()

    reemplazos = {

        "á": "a",
        "é": "e",
        "í": "i",
        "ó": "o",
        "ú": "u",
        "ü": "u",
        "ñ": "n"
    }

    for original, nuevo in reemplazos.items():

        texto = texto.replace(
            original,
            nuevo
        )

    texto = re.sub(
        r"[^a-z0-9\s]",
        " ",
        texto
    )

    texto = re.sub(
        r"\s+",
        " ",
        texto
    )

    return texto.strip()


# ============================================================
# NORMALIZAR TÍTULO
# ============================================================

def normalizar_titulo(titulo):

    titulo = normalizar_texto(
        titulo
    )

    # Quitar fuentes habituales al final.
    # Ejemplo:
    #
    # Boca confirmó la salida de Zeballos - Todo Jujuy
    #
    # queda:
    #
    # boca confirmo la salida de zeballos

    titulo = re.sub(
        r"\s+-\s+[^-]+$",
        "",
        titulo
    ).strip()

    return titulo


# ============================================================
# EXTRAER FUENTE
# ============================================================

def obtener_fuente(entrada):

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

    return limpiar_texto(
        fuente
    )
    # ============================================================
# OBTENER FECHA
# ============================================================

def obtener_fecha(entrada):

    publicado = entrada.get(
        "published_parsed"
    )

    if publicado:

        try:

            fecha = datetime(
                *publicado[:6],
                tzinfo=timezone.utc
            )

            return fecha.isoformat()

        except Exception:

            pass

    return ""


# ============================================================
# CREAR RESUMEN
# ============================================================

def crear_resumen(
    entrada,
    categoria
):

    resumen = entrada.get(
        "summary",
        ""
    )

    resumen = limpiar_texto(
        resumen
    )

    if len(resumen) > 350:

        resumen = (
            resumen[:350]
            .rsplit(" ", 1)[0]
            + "..."
        )

    # Google News muchas veces entrega
    # un resumen prácticamente vacío.
    # En ese caso usamos uno propio.

    if len(resumen) < 60:

        respaldos = {

            "Boca":
                "Todas las novedades de Boca Juniors, "
                "la actualidad del plantel y la información "
                "más importante del mundo Xeneize.",

            "Sudamericana":
                "Toda la información de Boca Juniors "
                "en la Copa Sudamericana, sus partidos, "
                "protagonistas y últimas novedades.",

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

        return respaldos.get(
            categoria,
            "Últimas novedades de Boca Juniors."
        )

    return resumen


# ============================================================
# OBTENER NOTICIAS DE UNA BÚSQUEDA
# ============================================================

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

    print(
        "Buscando: "
        + busqueda
    )

    feed = feedparser.parse(
        url
    )

    resultados = []

    for entrada in feed.entries[
        :MAX_NOTICIAS_POR_BUSQUEDA
    ]:

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

        if not link:
            continue

        fuente = obtener_fuente(
            entrada
        )

        fecha_iso = obtener_fecha(
            entrada
        )

        contenido = crear_resumen(
            entrada,
            categoria
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


# ============================================================
# CLAVE ÚNICA DE UNA NOTICIA
# ============================================================

def clave_noticia(noticia):

    titulo = normalizar_titulo(
        noticia.get(
            "titulo",
            ""
        )
    )

    if not titulo:
        return ""

    return titulo


# ============================================================
# CALCULAR SIMILITUD ENTRE TÍTULOS
# ============================================================

def similitud_titulos(
    titulo1,
    titulo2
):

    palabras1 = set(
        normalizar_titulo(
            titulo1
        ).split()
    )

    palabras2 = set(
        normalizar_titulo(
            titulo2
        ).split()
    )

    if not palabras1 or not palabras2:
        return 0

    interseccion = (
        palabras1
        .intersection(
            palabras2
        )
    )

    union = (
        palabras1
        .union(
            palabras2
        )
    )

    if not union:
        return 0

    return (
        len(interseccion)
        /
        len(union)
        )
    # ============================================================
# ELIMINAR NOTICIAS DUPLICADAS O MUY PARECIDAS
# ============================================================

def eliminar_duplicadas(lista):

    resultado = []

    claves = set()

    for noticia in lista:

        titulo = noticia.get(
            "titulo",
            ""
        ).strip()

        if not titulo:
            continue


        # ----------------------------------------------------
        # DUPLICADO EXACTO NORMALIZADO
        # ----------------------------------------------------

        clave = clave_noticia(
            noticia
        )

        if not clave:
            continue

        if clave in claves:
            continue


        # ----------------------------------------------------
        # DUPLICADO MUY PARECIDO
        # ----------------------------------------------------

        repetida = False

        for existente in resultado:

            titulo_existente = existente.get(
                "titulo",
                ""
            )

            similitud = similitud_titulos(
                titulo,
                titulo_existente
            )

            # 75% o más de palabras compartidas
            # significa que probablemente es
            # la misma noticia publicada por
            # otra fuente.

            if similitud >= 0.75:

                repetida = True
                break


        if repetida:
            continue


        claves.add(
            clave
        )

        resultado.append(
            noticia
        )


    return resultado


# ============================================================
# ORDENAR POR FECHA
# ============================================================

def ordenar_por_fecha(lista):

    def fecha_para_ordenar(noticia):

        fecha = noticia.get(
            "fecha_iso",
            ""
        )

        if not fecha:
            return datetime(
                1970,
                1,
                1,
                tzinfo=timezone.utc
            )

        try:

            return datetime.fromisoformat(
                fecha.replace(
                    "Z",
                    "+00:00"
                )
            )

        except Exception:

            return datetime(
                1970,
                1,
                1,
                tzinfo=timezone.utc
            )


    return sorted(
        lista,
        key=fecha_para_ordenar,
        reverse=True
    )


# ============================================================
# COMENZAR RECOLECCIÓN
# ============================================================

todas = []

print("")
print("============================================")
print("       BOCA 24/7 - ACTUALIZANDO NOTICIAS")
print("============================================")
print("")


for categoria, busquedas in CATEGORIAS.items():

    print(
        "Categoría: "
        + categoria
    )

    for busqueda in busquedas:

        try:

            noticias = obtener_noticias(
                busqueda,
                categoria
            )

            todas.extend(
                noticias
            )

            print(
                "  Noticias encontradas: "
                + str(
                    len(noticias)
                )
            )

        except Exception as error:

            print(
                "  ERROR: "
                + str(error)
            )


print("")
print(
    "Total antes de eliminar repetidas: "
    + str(
        len(todas)
    )
)


# ============================================================
# ELIMINAR DUPLICADAS
# ============================================================

noticias_finales = eliminar_duplicadas(
    todas
)


print(
    "Total después de eliminar repetidas: "
    + str(
        len(noticias_finales)
    )
)


# ============================================================
# ORDENAR
# ============================================================

noticias_finales = ordenar_por_fecha(
    noticias_finales
)


# ============================================================
# LIMITAR CANTIDAD
# ============================================================

noticias_finales = noticias_finales[
    :MAX_NOTICIAS_FINALES
]# ============================================================
# GUARDAR NOTICIAS.JSON
# ============================================================

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


# ============================================================
# INFORMACIÓN FINAL
# ============================================================

print("")
print("============================================")
print("        ACTUALIZACIÓN COMPLETADA")
print("============================================")

print(
    "Noticias guardadas: "
    + str(
        len(noticias_finales)
    )
)

print("Archivo generado: noticias.json")

print("============================================")
print("")


# ============================================================
# MOSTRAR LAS PRIMERAS NOTICIAS
# ============================================================

for numero, noticia in enumerate(
    noticias_finales[:10],
    start=1
):

    print(
        str(numero)
        + ". "
        + noticia.get(
            "titulo",
            ""
        )
    )

    print(
        "   Fuente: "
        + noticia.get(
            "fuente",
            ""
        )
    )

    print(
        "   Categoría: "
        + noticia.get(
            "categoria",
            ""
        )
    )

    print("")
