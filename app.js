document.addEventListener('DOMContentLoaded', () => {
  cargarSitioBoca247();
});

async function cargarSitioBoca247() {
  try {
    const res = await fetch('noticias.json?v=' + new Date().getTime());
    if (!res.ok) throw new Error('No se pudo acceder a noticias.json');

    const data = await res.json();

    if (data.noticias) renderNoticias(data.noticias);
    if (data.partidoEnVivo) renderPartido(data.partidoEnVivo);
    if (data.tablaPosiciones) renderTabla(data.tablaPosiciones);
    if (data.streaming) renderStreaming(data.streaming);
    if (data.resumenesYEntrevistas) renderResumenes(data.resumenesYEntrevistas);
    if (data.elHincha) renderHincha(data.elHincha);

  } catch (err) {
    console.error('Error al sincronizar Boca 24/7:', err);
  }
}

function renderNoticias(lista) {
  const contenedor = document.querySelector('#noticias .grid-noticias') || document.querySelector('#noticias') || document.getElementById('noticias');
  if (!contenedor || lista.length === 0) return;

  contenedor.innerHTML = lista.map(n => `
    <article class="card-noticia" style="background:#001b3a; border:1px solid #003366; border-radius:8px; padding:15px; margin-bottom:15px; color:#fff;">
      ${n.imagen ? `<div style="overflow:hidden; border-radius:6px; margin-bottom:10px;"><img src="${n.imagen}" alt="${n.titulo}" style="width:100%; height:auto;" loading="lazy"></div>` : ''}
      <div style="color:#f39c12; font-size:12px; font-weight:bold; margin-bottom:5px;">${n.categoria || 'FÚTBOL'} · ${n.etiqueta || 'BOCA 24/7'}</div>
      <h3 style="color:#fff; font-size:18px; margin:5px 0 10px 0;">${n.titulo}</h3>
      <p style="color:#ccc; font-size:14px; margin-bottom:12px;">${n.resumen}</p>
      <div style="display:flex; justify-content:space-between; border-top:1px solid rgba(255,255,255,0.1); padding-top:8px; font-size:12px; color:#888;">
        <span>📅 ${n.fecha}</span>
        <strong style="color:#f39c12;">BOCA 24/7</strong>
      </div>
    </article>
  `).join('');
}

function renderPartido(p) {
  const contenedor = document.querySelector('#partidos') || document.querySelector('#partido');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="background:#001b3a; border:2px solid ${p.enVivo ? '#ff0000' : '#003366'}; padding:15px; border-radius:8px; text-align:center; color:#fff; margin:15px 0;">
      <span style="background:${p.enVivo ? '#ff0000' : '#f39c12'}; color:${p.enVivo ? '#fff' : '#000'}; font-weight:bold; padding:3px 8px; border-radius:4px; font-size:12px;">
        ${p.enVivo ? '🔴 EN VIVO AHORA' : p.estado}
      </span>
      <div style="font-size:13px; color:#aaa; margin-top:8px;">${p.torneo}</div>
      <div style="display:flex; justify-content:space-around; align-items:center; margin:15px 0;">
        <strong style="font-size:18px;">${p.local}</strong>
        <span style="font-size:24px; font-weight:bold; background:#003366; padding:5px 15px; border-radius:6px; color:#f39c12;">
          ${p.golesLocal} - ${p.golesVisitante}
        </span>
        <strong style="font-size:18px;">${p.visitante}</strong>
      </div>
      <div style="font-size:13px; color:#ccc;">📍 ${p.estadio} | ⚽ ${p.detalle}</div>
    </div>
  `;
}

function renderTabla(tabla) {
  const contenedor = document.querySelector('#tabla') || document.querySelector('#posiciones');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <h2 style="color:#f39c12; margin-bottom:10px;">Tabla de Posiciones</h2>
    <div style="overflow-x:auto;">
      <table style="width:100%; border-collapse:collapse; color:#fff; text-align:center; font-size:14px;">
        <thead>
          <tr style="background:#003366; color:#f39c12;">
            <th style="padding:8px;">#</th>
            <th style="padding:8px; text-align:left;">Equipo</th>
            <th style="padding:8px;">PTS</th>
            <th style="padding:8px;">PJ</th>
            <th style="padding:8px;">DIF</th>
          </tr>
        </thead>
        <tbody>
          ${tabla.map(r => `
            <tr style="border-bottom:1px solid rgba(255,255,255,0.05); background:${r.equipo.includes('Boca') ? 'rgba(243,156,18,0.15)' : 'transparent'};">
              <td style="padding:8px; font-weight:bold; color:${r.equipo.includes('Boca') ? '#f39c12' : '#fff'};">${r.pos}</td>
              <td style="padding:8px; text-align:left; color:${r.equipo.includes('Boca') ? '#f39c12' : '#fff'}; font-weight:${r.equipo.includes('Boca') ? 'bold' : 'normal'};">${r.equipo}</td>
              <td style="padding:8px; font-weight:bold;">${r.pts}</td>
              <td style="padding:8px;">${r.pj}</td>
              <td style="padding:8px;">${r.dg}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function renderStreaming(st) {
  const contenedor = document.querySelector('#streaming');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="background:#001b3a; border:2px solid #f39c12; padding:20px; border-radius:8px; text-align:center; color:#fff; margin:15px 0;">
      <span style="background:#f39c12; color:#000; font-weight:bold; padding:3px 10px; border-radius:4px; font-size:12px;">
        ${st.enVivo ? '🔴 EN VIVO AHORA' : 'STREAMING XENEIZE'}
      </span>
      <h3 style="color:#fff; font-size:22px; margin:15px 0 5px 0;">${st.programa}</h3>
      <p style="color:#ccc; font-size:14px; max-width:600px; margin:0 auto 15px auto;">${st.descripcion}</p>
      <a href="${st.linkYoutube}" target="_blank" style="display:inline-block; background:#ff0000; color:#fff; font-weight:bold; padding:10px 20px; border-radius:5px; text-decoration:none;">
        ▶ Transmisión en YouTube
      </a>
      <div style="margin-top:10px; font-size:12px; color:#f39c12;">${st.horario}</div>
    </div>
  `;
}

function renderResumenes(items) {
  const contenedor = document.querySelector('#videos') || document.querySelector('#resumenes');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <h2 style="color:#f39c12; margin-bottom:15px;">Resúmenes y Entrevistas Post Partido</h2>
    <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:15px;">
      ${items.map(v => `
        <article style="background:#001b3a; border:1px solid #003366; padding:15px; border-radius:8px; color:#fff;">
          <span style="background:#003366; color:#f39c12; padding:2px 6px; border-radius:3px; font-size:11px; font-weight:bold;">${v.tipo}</span>
          <h4 style="color:#fff; margin:10px 0; font-size:15px;">${v.titulo}</h4>
          <div style="display:flex; justify-content:space-between; align-items:center; font-size:12px; color:#aaa; margin-top:10px;">
            <span>⏱️ ${v.duracion}</span>
            <a href="${v.link}" target="_blank" style="color:#f39c12; text-decoration:none; font-weight:bold;">Ver video ▶</a>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderHincha(h) {
  const contenedor = document.querySelector('#hinchas') || document.querySelector('#el-hincha');
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div style="background:#001b3a; border:1px solid #003366; padding:20px; border-radius:8px; color:#fff; margin:15px 0;">
      <span style="color:#f39c12; font-weight:bold; font-size:12px; text-transform:uppercase;">${h.comunidad}</span>
      <h3 style="color:#fff; font-size:20px; margin:8px 0;">${h.titulo}</h3>
      <p style="color:#ccc; font-size:14px; line-height:1.5;">${h.mensaje}</p>
      <div style="margin-top:12px; padding-top:10px; border-top:1px solid rgba(255,255,255,0.1); font-size:12px; color:#f39c12; font-weight:bold;">
        📣 ${h.contacto}
      </div>
    </div>
  `;
}
