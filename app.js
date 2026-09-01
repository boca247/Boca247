// ============================================================
// BOCA 24/7 - App.js COMPLETO Y FUNCIONAL
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  cargarSitioBoca247();
  inicializarFiltros();
  inicializarBotones();
  inicializarNavegacion();
});

let noticiasGlobal = [];
let videosGlobal = [];
let filtroActual = 'TODAS';

// ============================================================
// CARGAR DATOS
// ============================================================

async function cargarSitioBoca247() {
  try {
    const res = await fetch('noticias.json?v=' + new Date().getTime());
    if (!res.ok) throw new Error('No se pudo acceder a noticias.json');

    const data = await res.json();

    // Cargar noticias
    if (data.noticias && Array.isArray(data.noticias)) {
      noticiasGlobal = data.noticias;
      renderNoticias(noticiasGlobal);
    }

    // Cargar videos
    if (data.videos && Array.isArray(data.videos)) {
      videosGlobal = data.videos;
      renderVideos(videosGlobal);
    }

    // Cargar partidos
    if (data.partidos && Array.isArray(data.partidos)) {
      renderPartidos(data.partidos);
    }

    // Cargar tabla
    if (data.tabla && Array.isArray(data.tabla)) {
      renderTabla(data.tabla);
    }

    // Cargar streaming
    if (data.streaming && Array.isArray(data.streaming)) {
      renderStreaming(data.streaming);
    }

    // Cargar hinchas
    if (data.hinchas && Array.isArray(data.hinchas)) {
      renderHinchas(data.hinchas);
    }

    // Actualizar ticker
    if (data.noticias && data.noticias.length > 0) {
      document.getElementById('tickerText').textContent = 
        data.noticias[0].titulo || 'Toda la actualidad de Boca';
    }

  } catch (err) {
    console.error('Error al sincronizar Boca 24/7:', err);
  }
}

// ============================================================
// RENDERIZAR NOTICIAS
// ============================================================

function renderNoticias(lista) {
  const contenedor = document.getElementById('newsGrid');
  if (!contenedor || !lista || lista.length === 0) return;

  contenedor.innerHTML = lista.map((noticia, idx) => {
    const titulo = noticia.titulo || 'Sin título';
    const fuente = noticia.fuente || 'BOCA 24/7';
    const contenido = noticia.contenido || 'Información del mundo Xeneize';
    const link = noticia.link || '#';
    const categoria = noticia.categoria || 'Boca';
    const fecha = formatearFecha(noticia.fecha_iso);
    const imagen = obtenerImagenPorIndice(idx);

    return `
      <article class="card-noticia">
        <div class="card-imagen" style="background-image: url('${imagen}')">
          <span class="card-categoria">${categoria}</span>
        </div>
        <div class="card-cuerpo">
          <div class="card-fuente">${fuente}</div>
          <h3 class="card-titulo">${titulo}</h3>
          <p class="card-resumen">${contenido}</p>
          <div class="card-footer">
            <span class="card-fecha">📅 ${fecha}</span>
            <a href="${link}" target="_blank" class="card-link">Leer →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAR VIDEOS
// ============================================================

function renderVideos(lista) {
  const contenedor = document.getElementById('videosGrid');
  if (!contenedor || !lista || lista.length === 0) return;

  contenedor.innerHTML = lista.map((video, idx) => {
    const titulo = video.titulo || 'Video de Boca';
    const descripcion = video.descripcion || 'Resumen y análisis';
    const imagen = obtenerImagenPorIndice(idx);
    const link = video.link || '#';
    const duracion = video.duracion || '12:34';

    return `
      <article class="card-noticia">
        <div class="card-imagen" style="background-image: url('${imagen}')">
          <div style="position: absolute; bottom: 12px; left: 12px; z-index: 2; background: #ffd400; color: #001b4d; padding: 4px 8px; border-radius: 3px; font-size: 10px; font-weight: 900;">
            ▶ ${duracion}
          </div>
        </div>
        <div class="card-cuerpo">
          <div class="card-fuente">VIDEO</div>
          <h3 class="card-titulo">${titulo}</h3>
          <p class="card-resumen">${descripcion}</p>
          <div class="card-footer">
            <span class="card-fecha">📹 Multimedia</span>
            <a href="${link}" target="_blank" class="card-link">Ver →</a>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAR PARTIDOS
// ============================================================

function renderPartidos(lista) {
  const contenedor = document.getElementById('partidosContainer');
  if (!contenedor || !lista || lista.length === 0) return;

  contenedor.innerHTML = lista.map(partido => {
    const fecha = formatearFecha(partido.fecha_iso);
    const horaMinutos = partido.hora || 'TBD';
    
    return `
      <div class="match-card">
        <div class="match-top">
          <span>${fecha}</span>
          <span>${horaMinutos}</span>
          <span>${partido.torneo || 'TORNEO'}</span>
        </div>

        <div class="match-teams">
          <div class="team">
            <div class="team-badge ${partido.equipo_local === 'Boca' ? 'boca' : ''}">
              ${partido.equipo_local === 'Boca' ? '🔵' : '⚪'}
            </div>
            <strong>${partido.equipo_local}</strong>
          </div>

          <div class="match-center">
            <small>VS</small>
            <div class="score">
              ${partido.goles_local !== undefined ? partido.goles_local : '-'}
              <b>:</b>
              ${partido.goles_visitante !== undefined ? partido.goles_visitante : '-'}
            </div>
            <strong>${partido.estado || 'PROGRAMADO'}</strong>
          </div>

          <div class="team">
            <div class="team-badge">
              ⚪
            </div>
            <strong>${partido.equipo_visitante}</strong>
          </div>
        </div>

        <div class="match-footer">
          <span>${partido.estadio || 'Estadio'}</span>
          <span>${partido.arbitro || 'Arbitro'}</span>
          <span>${partido.asistencia ? partido.asistencia + ' espectadores' : 'Capacidad'}</span>
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAR TABLA
// ============================================================

function renderTabla(lista) {
  const contenedor = document.getElementById('tablaContainer');
  if (!contenedor || !lista || lista.length === 0) return;

  let html = `
    <table class="tabla-standings">
      <thead>
        <tr>
          <th>POS</th>
          <th>EQUIPO</th>
          <th>PJ</th>
          <th>G</th>
          <th>E</th>
          <th>P</th>
          <th>GF</th>
          <th>GC</th>
          <th>DIF</th>
          <th>PTS</th>
        </tr>
      </thead>
      <tbody>
  `;

  lista.forEach(equipo => {
    const isBoca = equipo.equipo === 'Boca';
    html += `
      <tr ${isBoca ? 'class="boca-row"' : ''}>
        <td class="posicion">${equipo.posicion}</td>
        <td class="equipo">${equipo.equipo}</td>
        <td>${equipo.pj}</td>
        <td>${equipo.g}</td>
        <td>${equipo.e}</td>
        <td>${equipo.p}</td>
        <td>${equipo.gf}</td>
        <td>${equipo.gc}</td>
        <td>${equipo.dif}</td>
        <td class="puntos"><strong>${equipo.pts}</strong></td>
      </tr>
    `;
  });

  html += `
      </tbody>
    </table>
  `;

  contenedor.innerHTML = html;
}

// ============================================================
// RENDERIZAR STREAMING
// ============================================================

function renderStreaming(lista) {
  const contenedor = document.getElementById('streamingContainer');
  if (!contenedor || !lista || lista.length === 0) return;

  contenedor.innerHTML = lista.map(stream => {
    return `
      <div class="streaming-card">
        <span class="eyebrow yellow">${stream.tipo || 'EN VIVO'}</span>
        <h3>${stream.titulo || 'Los Bosteros de Tucumán'}</h3>
        <p>${stream.descripcion || 'Transmisión en vivo de la comunidad Xeneize'}</p>
        <a href="${stream.link || '#'}" target="_blank" class="primary-button">
          VER AHORA →
        </a>
      </div>
    `;
  }).join('');
}

// ============================================================
// RENDERIZAR HINCHAS
// ============================================================

function renderHinchas(lista) {
  const contenedor = document.getElementById('hinchaContainer');
  if (!contenedor || !lista || lista.length === 0) return;

  contenedor.innerHTML = lista.map(hincha => {
    return `
      <div class="poll-card">
        <h3>${hincha.titulo || 'Pregunta'}</h3>
        
        <div class="poll-options">
          ${hincha.opciones ? hincha.opciones.map((op, idx) => `
            <button onclick="votarPoll(${idx})">${op}</button>
          `).join('') : ''}
        </div>

        <div class="poll-result">
          ${hincha.resultado || 'Participación de la hinchada'}
        </div>
      </div>
    `;
  }).join('');
}

// ============================================================
// FILTRAR NOTICIAS
// ============================================================

function inicializarFiltros() {
  const botones = document.querySelectorAll('.news-categories button');
  botones.forEach((btn, idx) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const categoria = btn.textContent.trim();
      filtrarNoticias(categoria, btn);
    });
    // Activar primer botón por defecto
    if (idx === 0) btn.classList.add('activo');
  });
}

function filtrarNoticias(categoria, botonClickeado) {
  filtroActual = categoria;

  // Desactivar todos los botones
  document.querySelectorAll('.news-categories button').forEach(btn => {
    btn.classList.remove('activo');
  });

  // Activar botón clickeado
  botonClickeado.classList.add('activo');

  // Filtrar y renderizar
  if (categoria === 'TODAS') {
    renderNoticias(noticiasGlobal);
  } else {
    const noticiasFiltradas = noticiasGlobal.filter(n => 
      n.categoria.toUpperCase() === categoria.toUpperCase()
    );
    renderNoticias(noticiasFiltradas);
  }
}

// ============================================================
// BOTONES
// ============================================================

function inicializarBotones() {
  const btnReload = document.getElementById('reloadNews');
  if (btnReload) {
    btnReload.addEventListener('click', () => {
      const textoOriginal = btnReload.textContent;
      btnReload.textContent = '⟳ ACTUALIZANDO...';
      btnReload.disabled = true;
      
      cargarSitioBoca247().finally(() => {
        btnReload.textContent = textoOriginal;
        btnReload.disabled = false;
      });
    });
  }
}

// ============================================================
// NAVEGACIÓN SUAVE
// ============================================================

function inicializarNavegacion() {
  document.querySelectorAll('a[href^="#"]').forEach(enlace => {
    enlace.addEventListener('click', (e) => {
      const href = enlace.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const elemento = document.querySelector(href);
      if (elemento) {
        elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
}

// ============================================================
// HELPERS
// ============================================================

function formatearFecha(fechaISO) {
  if (!fechaISO) return 'Hoy';
  
  try {
    const fecha = new Date(fechaISO);
    const hoy = new Date();
    const diferencia = hoy - fecha;
    const dias = Math.floor(diferencia / (1000 * 60 * 60 * 24));

    if (dias === 0) return 'Hoy';
    if (dias === 1) return 'Ayer';
    if (dias < 7) return `Hace ${dias}d`;
    
    return fecha.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit'
    });
  } catch (e) {
    return 'Reciente';
  }
}

function obtenerImagenPorIndice(idx) {
  const imagenes = [
    'IMG-20260829-WA0001.jpg',
    'IMG-20260829-WA0003.jpg',
    'IMG-20260830-WA0002.jpg',
    'IMG-20260830-WA0004.jpg',
    'IMG-20260830-WA0006.jpg',
  ];
  return imagenes[idx % imagenes.length];
}

function votarPoll(idx) {
  alert('Voto registrado en la opción ' + (idx + 1));
  // Aquí irían requests a backend para guardar votos
}
