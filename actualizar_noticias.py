#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
BOCA 24/7 - Actualizador de Noticias
Genera noticias.json con datos de Boca Juniors
"""

import json
import requests
from datetime import datetime, timezone
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET
import os

# ============================================================
# CONFIGURACIÓN
# ============================================================

URL_GOOGLE_NEWS = "https://news.google.com/rss/search?q=Boca+Juniors&hl=es-419&gl=AR&ceid=AR:es-419"
ARCHIVO_SALIDA = "noticias.json"

# ============================================================
# FUNCIONES AUXILIARES
# ============================================================

def limpiar_texto(texto):
    """Limpia HTML y entidades XML del texto"""
    if not texto:
        return ""

    # Remover tags HTML
    try:
        texto = ET.fromstring(f"<root>{texto}</root>").text or ""
    except ET.ParseError:
        # Si el texto trae caracteres que rompen el XML (& sueltos, etc.)
        # lo dejamos tal cual y solo limpiamos entidades más abajo.
        pass

    # Decodificar entidades
    entidades = {
        "&amp;": "&",
        "&quot;": '"',
        "&#39;": "'",
        "&apos;": "'",
        "&lt;": "<",
        "&gt;": ">",
        "&#8217;": "'",
        "&#8211;": "–",
        "&#8230;": "…"
    }

    for entidad, caracter in entidades.items():
        texto = texto.replace(entidad, caracter)

    return texto.strip()

def extraer_de_xml(texto, etiqueta):
    """Extrae contenido de una etiqueta XML"""
    try:
        raiz = ET.fromstring(f"<root>{texto}</root>")
        elem = raiz.find(f".//{{{raiz.tag.split('}')[0][1:]}}}{etiqueta}" if '}' in raiz.tag else f".//{etiqueta}")
        return elem.text if elem is not None else ""
    except:
        # Fallback con regex si hay error en parsing
        import re
        patron = f"<{etiqueta}(?:[^>]*)>([\\s\\S]*?)<\\/{etiqueta}>"
        resultado = re.search(patron, texto, re.IGNORECASE)
        return resultado.group(1) if resultado else ""

def obtener_noticias():
    """Obtiene noticias de Google News RSS"""
    noticias = []

    try:
        headers = {"User-Agent": "Mozilla/5.0 BOCA247"}
        response = requests.get(URL_GOOGLE_NEWS, headers=headers, timeout=10)
        response.encoding = 'utf-8'

        if response.status_code != 200:
            print(f"⚠️ Error al obtener noticias: {response.status_code}")
            return []

        # Parsear RSS
        root = ET.fromstring(response.content)

        items = root.findall('.//item')

        for item in items[:30]:  # Límite de 30 noticias
            try:
                titulo_elem = item.find('title')
                link_elem = item.find('link')
                desc_elem = item.find('description')
                pubdate_elem = item.find('pubDate')
                source_elem = item.find('source')

                titulo = limpiar_texto(titulo_elem.text if titulo_elem is not None else "")
                link = link_elem.text if link_elem is not None else ""
                descripcion = limpiar_texto(desc_elem.text if desc_elem is not None else "")
                fecha_pub = pubdate_elem.text if pubdate_elem is not None else ""
                fuente = limpiar_texto(source_elem.text if source_elem is not None else "Google Noticias")

                if not titulo:
                    continue

                # Clasificar por categoría
                categoria = clasificar_noticia(titulo.lower())

                # Convertir fecha
                fecha_iso = convertir_fecha_rss(fecha_pub)

                noticia = {
                    "titulo": titulo,
                    "fuente": fuente or "Google Noticias",
                    "contenido": descripcion[:200] if descripcion else "Información del mundo Xeneize",
                    "link": link,
                    "categoria": categoria,
                    "fecha_iso": fecha_iso
                }

                noticias.append(noticia)

            except Exception as e:
                print(f"⚠️ Error procesando item: {e}")
                continue

        print(f"✅ Obtenidas {len(noticias)} noticias de Google News")
        return noticias

    except requests.exceptions.RequestException as e:
        print(f"❌ Error de conexión: {e}")
        return []

def clasificar_noticia(titulo):
    """Clasifica la noticia por categoría"""
    palabras_clave = {
        "COPA ARGENTINA": ["copa argentina", "velez", "vélez"],
        "COPA SUDAMERICANA": ["sudamericana", "sao paulo", "são paulo", "san pablo"],
        "MERCADO DE PASES": ["mercado", "fichaje", "refuerzo", "venta", "transferencia", "monza", "zeballos"],
        "PLANTEL": ["lesion", "lesión", "operado", "operación", "baja", "bareiro"],
        "FEMENINO": ["femenino", "mujeres", "damas", "gladiadoras"],
        "RESERVA": ["reserva", "reservistas"],
        "JUVENILES": ["juvenil", "juveniles", "sub-17", "sub-20", "cantera"],
        "BÁSQUET": ["basquet", "básquet", "baloncesto"],
        "VÓLEY": ["voleibol", "voley", "vóley"],
        "FUTSAL": ["futsal", "futsala"],
        "TORNEO CLAUSURA": ["clausura", "torneo", "liga profesional", "playoffs"],
        "INSTITUCIONAL": ["club", "directiva", "riquelme", "comunicado"]
    }

    for categoria, palabras in palabras_clave.items():
        if any(palabra in titulo for palabra in palabras):
            return categoria

    return "FÚTBOL"  # Por defecto

def convertir_fecha_rss(fecha_str):
    """Convierte fecha RSS (RFC 2822, ej: 'Fri, 30 Aug 2024 15:30:00 GMT') a ISO 8601 UTC"""
    if not fecha_str:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

    try:
        fecha = parsedate_to_datetime(fecha_str)
        if fecha.tzinfo is None:
            fecha = fecha.replace(tzinfo=timezone.utc)
        fecha = fecha.astimezone(timezone.utc)
        return fecha.isoformat().replace("+00:00", "Z")
    except Exception:
        return datetime.now(timezone.utc).isoformat().replace("+00:00", "Z")

# ============================================================
# DATOS ESTÁTICOS (Para secciones sin fuente externa)
# Actualizado manualmente al 01/09/2026 19:24 hs (ART)
# ============================================================

VIDEOS_DEFAULT = [
    {
        "titulo": "Así fue la emotiva despedida de Zeballos en Boca Predio",
        "descripcion": "El video institucional con el que el club se despidió del Changuito tras su venta al Monza de Italia.",
        "link": "https://twitter.com/BocaJrsOficial",
        "duracion": "01:45",
        "fecha_iso": "2026-09-01T17:40:00-03:00"
    },
    {
        "titulo": "La probable formación de Arruabarrena para enfrentar a Vélez",
        "descripcion": "Análisis del equipo pensado para los octavos de final de la Copa Argentina en Córdoba.",
        "link": "https://www.tycsports.com",
        "duracion": "08:20",
        "fecha_iso": "2026-09-01T15:00:00-03:00"
    }
]

PARTIDOS_DEFAULT = [
    {
        "fecha_iso": "2026-09-02T21:15:00-03:00",
        "hora": "21:15",
        "equipo_local": "Boca",
        "equipo_visitante": "Vélez Sarsfield",
        "goles_local": None,
        "goles_visitante": None,
        "estado": "PROGRAMADO",
        "torneo": "COPA ARGENTINA - OCTAVOS DE FINAL",
        "estadio": "Estadio Mario Alberto Kempes",
        "ciudad": "Córdoba",
        "arbitro": "Sebastián Zunino",
        "asistencia": None
    },
    {
        "fecha_iso": "2026-09-06T15:00:00-03:00",
        "hora": "15:00",
        "equipo_local": "Gimnasia (Mendoza)",
        "equipo_visitante": "Boca",
        "goles_local": None,
        "goles_visitante": None,
        "estado": "PROGRAMADO",
        "torneo": "TORNEO CLAUSURA",
        "estadio": "Estadio Víctor Antonio Legrotaglie",
        "ciudad": "Mendoza",
        "arbitro": None,
        "asistencia": None
    },
    {
        "fecha_iso": "2026-09-08T21:30:00-03:00",
        "hora": "21:30",
        "equipo_local": "Boca",
        "equipo_visitante": "São Paulo",
        "goles_local": None,
        "goles_visitante": None,
        "estado": "PROGRAMADO",
        "torneo": "COPA SUDAMERICANA - CUARTOS DE FINAL (IDA)",
        "estadio": "La Bombonera (Alberto J. Armando)",
        "ciudad": "Buenos Aires",
        "arbitro": None,
        "asistencia": None
    }
]

# Último resultado real: Boca 1-0 Lanús, Torneo Clausura, Fecha 7 (28/08/2026), gol de Tomás Belmonte
RESULTADOS_DEFAULT = [
    {
        "fecha_iso": "2026-08-28T21:00:00-03:00",
        "equipo_local": "Boca",
        "equipo_visitante": "Lanús",
        "goles_local": 1,
        "goles_visitante": 0,
        "estado": "FINALIZADO",
        "torneo": "TORNEO CLAUSURA - FECHA 7",
        "estadio": "La Bombonera (Alberto J. Armando)",
        "goleador": "Tomás Belmonte (90'+3)"
    }
]

# Tabla de posiciones real: Torneo Clausura 2026, Zona A, tras la Fecha 7
TABLA_DEFAULT = [
    {"posicion": 1, "equipo": "Instituto", "pts": 16},
    {"posicion": 2, "equipo": "Gimnasia (Mendoza)", "pts": 15},
    {"posicion": 7, "equipo": "Independiente", "pts": 10},
    {"posicion": 8, "equipo": "Boca", "pts": 10}
]

STREAMING_DEFAULT = [
    {
        "titulo": "Los Bosteros de Tucumán",
        "descripcion": "Canal de streaming oficial de la comunidad.",
        "link": "https://twitch.tv/losbosterosdetucuman",
        "tipo": "EN VIVO"
    }
]

HINCHAS_DEFAULT = [
    {
        "titulo": "¿Cómo te imaginás a Boca-Vélez por la Copa Argentina?",
        "opciones": ["Gana Boca", "Empate (define penales)", "Gana Vélez"],
        "resultado": "Encuesta abierta - se actualiza en vivo"
    }
]

# ============================================================
# GENERAR Y GUARDAR JSON
# ============================================================

def generar_json_completo():
    """Genera el archivo noticias.json completo"""

    print("🔄 Sincronizando BOCA 24/7...")

    noticias = obtener_noticias()

    data = {
        "actualizado": datetime.now(timezone.utc).isoformat().replace("+00:00", "Z"),
        "noticias": noticias,
        "videos": VIDEOS_DEFAULT,
        "partidos": PARTIDOS_DEFAULT,
        "resultados": RESULTADOS_DEFAULT,
        "tabla": TABLA_DEFAULT,
        "streaming": STREAMING_DEFAULT,
        "hinchas": HINCHAS_DEFAULT
    }

    # Guardar JSON
    try:
        with open(ARCHIVO_SALIDA, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)

        print(f"✅ noticias.json actualizado con éxito")
        print(f"   - {len(noticias)} noticias")
        print(f"   - {len(VIDEOS_DEFAULT)} videos")
        print(f"   - {len(PARTIDOS_DEFAULT)} partidos")
        print(f"   - {len(TABLA_DEFAULT)} equipos en tabla")
        return True

    except Exception as e:
        print(f"❌ Error al guardar: {e}")
        return False

# ============================================================
# MAIN
# ============================================================

if __name__ == "__main__":
    generar_json_completo()
