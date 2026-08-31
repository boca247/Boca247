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
        error: "No se pudo consultar la fuente de noticias"
      });
    }

    const xml = await response.text();

    const items = xml.match(/<item>[\s\S]*?<\/item>/gi) || [];

    const noticias = items.slice(0, 30).map((item) => ({
      titulo: limpiar(extraer(item, "title")),
      link: extraer(item, "link"),
      descripcion: limpiar(extraer(item, "description")),
      fecha: extraer(item, "pubDate"),
      fuente: extraerFuente(item)
    }));

    return res.status(200).json({
      ok: true,
      actualizado: new Date().toISOString(),
      cantidad: noticias.length,
      noticias
    });

  } catch (error) {
    console.error(error);

    return res.status(500).json({
      ok: false,
      error: "Error interno obteniendo noticias"
    });
  }
}

function extraer(texto, etiqueta) {
  const regex = new RegExp(
    `<${etiqueta}(?:[^>]*)>([\\s\\S]*?)<\\/${etiqueta}>`,
    "i"
  );

  const resultado = texto.match(regex);

  if (!resultado) return "";

  return resultado[1]
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/gi, "$1")
    .trim();
}

function extraerFuente(item) {
  const fuente = extraer(item, "source");

  return fuente ? limpiar(fuente) : "Google Noticias";
}

function limpiar(texto) {
  return texto
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
