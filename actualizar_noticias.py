#!/usr/bin/env python3
# -*- coding: utf-8 -*-

"""
BOCA 24/7 - Actualizador de Noticias
Genera noticias.json con datos de Boca Juniors
"""

import json
import requests
from datetime import datetime
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
    texto = ET.fromstring(f"<root>{texto}</root>").text or ""
    
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
        namespace = {'': 'http://www.rss.org/version/2.0/'}
        
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
        "FÚTBOL": ["futbol", "partido", "gol", "campeonato", "liga", "torneo", "entrenamiento"],
        "FEMENINO": ["femenino", "mujeres", "damas", "gladiadoras"],
        "RESERVA": ["reserva", "reservistas"],
        "JUVENILES": ["juvenil", "juveniles", "sub-17", "sub-20", "cantera"],
        "BÁSQUET": ["basquet", "básquet", "baloncesto", "bombonera"],
        "VÓLEY": ["voleibol", "voley", "vóley"],
        "FUTSAL": ["futsal", "futsala"],
        "INSTITUCIONAL": ["boca", "club", "directiva", "presidente", "comunicado"]
    }
    
    for categoria, palabras in palabras_clave.items():
        if any(palabra in titulo for palabra in palabras):
            return categoria
    
    return "FÚTBOL"  # Por defecto

def convertir_fecha_rss(fecha_str):
    """Convierte fecha RSS a ISO 8601"""
    if not fecha_str:
        return datetime.utcnow().isoformat() + "Z"
    
    try:
        # Formato típico: "Fri, 30 Aug 2024 15:30:00 GMT"
        fecha = datetime.strptime(fecha_str, "%a, %d %b %Y %H:%M:%S %Z")
        return fecha.isoformat() + "Z"
    except:
        try:
            # Otro formato posible
            fecha = datetime.strptime(fecha_str.split("GMT")[0].strip(), "%a, %d %b %Y %H:%M:%S")
            return fecha.isoformat() + "Z"
        except:
            return datetime.utcnow().isoformat() + "Z"

# ============================================================
# DATOS ESTÁTICOS (Para secciones sin fuente externa)
# ============================================================

VIDEOS_DEFAULT = [
    {
        "titulo": "Resumen del último partido de Boca",
        "descripcion": "Compacto del encuentro con los goles y mejores jugadas.",
        "link": "https://youtube.com/watch?v=boca",
        "duracion": "12:34",
        "fecha_iso": datetime.utcnow().isoformat() + "Z"
    },
    {
        "titulo": "Entrevista con el técnico",
        "descripcion": "Análisis de la campaña y próximos objetivos.",
        "link": "https://youtube.com/watch?v=tecnico",
        "duracion": "18:45",
        "fecha_iso": (datetime.utcnow()).isoformat() + "Z"
    }
]

PARTIDOS_DEFAULT = [
    {
        "fecha_iso": "2024-09-08T19:00:00Z",
        "hora": "19:00",
        "equipo_local": "Boca",
        "equipo_visitante": "Independiente",
        "goles_local": None,
        "goles_visitante": None,
        "estado": "PROGRAMADO",
        "torneo": "CAMPEONATO",
        "estadio": "La Bombonera",
        "arbitro": "Arbitro confirmado",
        "asistencia": None
    }
]

TABLA_DEFAULT = [
    {
        "posicion": 1,
        "equipo": "Boca",
        "pj": 15, "g": 10, "e": 3, "p": 2,
        "gf": 28, "gc": 12, "dif": 16, "pts": 33
    },
    {
        "posicion": 2,
        "equipo": "River",
        "pj": 15, "g": 9, "e": 4, "p": 2,
        "gf": 26, "gc": 10, "dif": 16, "pts": 31
    }
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
        "titulo": "¿Quién debería ser el próximo refuerzo?",
        "opciones": ["Delantero", "Mediocampista", "Defensor", "Arquero"],
        "resultado": "57% Delantero | 23% Mediocampista | 15% Defensor | 5% Arquero"
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
        "actualizado": datetime.utcnow().isoformat() + "Z",
        "noticias": noticias,
        "videos": VIDEOS_DEFAULT,
        "partidos": PARTIDOS_DEFAULT,
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
    
