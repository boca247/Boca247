export default async function handler(req, res) {
  try {

    const url =
      "https://news.google.com/rss/search?q=Boca+Juniors&hl=es-419&gl=AR&ceid=AR:es-419";

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 BOCA247"
      }
    });

    if (!response.ok) {
      return res.status(500).json({
        ok: false,
        error: "No se pudo consultar Google News"
      });
    }

    const xml = await response.text();

    const items =
      xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const noticias = [];

    const vistos = new Set();

    for (const item of items) {

      const titulo =
        limpiar(extraer(item, "title"));

      const link =
        limpiar(extraer(item, "link"));

      const descripcion =
        limpiar(extraer(item, "description"));

      const fecha =
        extraer(item, "pubDate");

      const fuente =
        extraerFuente(item);

      if (!titulo) {
        continue;
      }

      /*
       * Google News puede devolver
       * varias entradas con el mismo título.
       * Guardamos solamente una.
       */

      const clave =
        titulo
          .toLowerCase()
          .replace(/\s+/g, " ")
          .trim();

      if (vistos.has(clave)) {
        continue;
      }

      vistos.add(clave);

      noticias.push({

        titulo,

        fuente,

        contenido:
          descripcion ||
          "Todas las novedades de Boca Juniors.",

        link,

        categoria:
          detectarCategoria(
            titulo + " " + descripcion
          ),

        fecha_iso:
          convertirFecha(fecha)

      });

      /*
       * Máximo 30 noticias ÚNICAS.
       */

      if (noticias.length >= 30) {
        break;
      }
    }

    return res.status(200).json({
      ok: true,
      actualizado:
        new Date().toISOString(),
      cantidad:
        noticias.length,
      noticias
    });

  } catch (error) {

    console.error(error);

    return res.status(500).json({
      ok: false,
      error:
        "Error interno obteniendo noticias"
    });

  }
}


/* =========================
   EXTRAER XML
========================= */

function extraer(texto, etiqueta) {

  const regex =
    new RegExp(
      `<${etiqueta}(?:[^>]*)>([\\s\\S]*?)<\\/${etiqueta}>`,
      "i"
    );

  const resultado =
    texto.match(regex);

  if (!resultado) {
    return "";
  }

  return resultado[1]
    .replace(
      /<!\[CDATA\[([\s\S]*?)\]\]>/gi,
      "$1"
    )
    .trim();
}


/* =========================
   FUENTE
========================= */

function extraerFuente(item) {

  const fuente =
    extraer(item, "source");

  return fuente
    ? limpiar(fuente)
    : "Google Noticias";

}


/* =========================
   LIMPIAR
========================= */

function limpiar(texto) {

  return String(texto || "")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&#8217;/g, "’")
    .replace(/&#8211;/g, "–")
    .replace(/&#8230;/g, "…")
    .trim();

}


/* =========================
   FECHA
========================= */

function convertirFecha(fecha) {

  if (!fecha) {
    return new Date().toISOString();
  }

  const d =
    new Date(fecha);

  if (isNaN(d.getTime())) {
    return new Date().toISOString();
  }

  return d.toISOString();

}


/* =========================
   CATEGORÍAS
========================= */

function detectarCategoria(texto) {

  const t =
    String(texto || "")
      .toLowerCase();

  if (
    t.includes("mercado") ||
    t.includes("refuerzo") ||
    t.includes("fichaje") ||
    t.includes("incorporación") ||
    t.includes("incorporacion") ||
    t.includes("transferencia")
  ) {
    return "Mercado";
  }

  if (
    t.includes("lesión") ||
    t.includes("lesion") ||
    t.includes("lesionado") ||
    t.includes("desgarro") ||
    t.includes("molestia")
  ) {
    return "Lesiones";
  }

  if (
    t.includes("básquet") ||
    t.includes("basquet")
  ) {
    return "Básquet";
  }

  if (
    t.includes("futsal")
  ) {
    return "Futsal";
  }

  if (
    t.includes("femenino") ||
    t.includes("femenina")
  ) {
    return "Femenino";
  }

  if (
    t.includes("reserva")
  ) {
    return "Reserva";
  }

  if (
    t.includes("inferiores") ||
    t.includes("juveniles") ||
    t.includes("juvenil")
  ) {
    return "Inferiores";
  }

  if (
    t.includes("bombonera") ||
    t.includes("estadio")
  ) {
    return "Bombonera";
  }

  if (
    t.includes("partido") ||
    t.includes("juega") ||
    t.includes("copa") ||
    t.includes("fixture") ||
    t.includes("sudamericana")
  ) {
    return "Partidos";
  }

  if (
    t.includes("jugador") ||
    t.includes("plantel") ||
    t.includes("entrenamiento")
  ) {
    return "Plantel";
  }

  return "Boca";

}
