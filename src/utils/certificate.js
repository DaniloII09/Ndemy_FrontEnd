// Plantilla de certificado (SVG) + descarga como PNG, sin dependencias externas.

const WIDTH = 1200;
const HEIGHT = 849;

// Escapa texto para insertarlo de forma segura dentro del SVG
function esc(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatDate(iso) {
  if (!iso) return '';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      day: 'numeric', month: 'long', year: 'numeric',
    });
  } catch {
    return '';
  }
}

// Construye el markup SVG del certificado
export function buildCertificateSvg(cert) {
  const studentName = esc(cert.studentName ?? '');
  const courseTitle = esc(cert.courseTitle ?? '');
  const date = esc(formatDate(cert.issuedAt));
  const code = esc(cert.certificateCode ?? '');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#1a1625"/>
      <stop offset="1" stop-color="#0f0d14"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#aa3bff"/>
      <stop offset="1" stop-color="#7c3aed"/>
    </linearGradient>
  </defs>

  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)"/>
  <rect x="28" y="28" width="${WIDTH - 56}" height="${HEIGHT - 56}" fill="none" stroke="url(#accent)" stroke-width="3" rx="18"/>
  <rect x="44" y="44" width="${WIDTH - 88}" height="${HEIGHT - 88}" fill="none" stroke="#2a2535" stroke-width="1.5" rx="12"/>

  <!-- Marca -->
  <g transform="translate(${WIDTH / 2}, 130)" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif">
    <circle cx="0" cy="0" r="34" fill="url(#accent)"/>
    <text x="0" y="14" font-size="38" font-weight="700" fill="#ffffff" font-family="Arial, sans-serif">N</text>
  </g>
  <text x="${WIDTH / 2}" y="205" text-anchor="middle" font-family="Arial, sans-serif" font-size="22" letter-spacing="6" fill="#c084fc" font-weight="700">N D E M Y</text>

  <text x="${WIDTH / 2}" y="285" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="#f3f0ff" font-weight="700">Certificado de Finalización</text>
  <line x1="${WIDTH / 2 - 120}" y1="312" x2="${WIDTH / 2 + 120}" y2="312" stroke="url(#accent)" stroke-width="3"/>

  <text x="${WIDTH / 2}" y="378" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#9d97aa">Se otorga el presente certificado a</text>

  <text x="${WIDTH / 2}" y="452" text-anchor="middle" font-family="Georgia, serif" font-size="56" fill="#ffffff" font-weight="700">${studentName}</text>

  <text x="${WIDTH / 2}" y="512" text-anchor="middle" font-family="Arial, sans-serif" font-size="20" fill="#9d97aa">por haber completado satisfactoriamente el curso</text>

  <text x="${WIDTH / 2}" y="568" text-anchor="middle" font-family="Georgia, serif" font-size="34" fill="#c084fc" font-weight="700">${courseTitle}</text>

  <!-- Pie -->
  <g font-family="Arial, sans-serif">
    <text x="160" y="700" font-size="17" fill="#7a7388">Fecha de emisión</text>
    <text x="160" y="728" font-size="20" fill="#f3f0ff" font-weight="600">${date}</text>
    <line x1="160" y1="746" x2="430" y2="746" stroke="#2a2535" stroke-width="1.5"/>

    <text x="${WIDTH - 160}" y="700" text-anchor="end" font-size="17" fill="#7a7388">Código de verificación</text>
    <text x="${WIDTH - 160}" y="728" text-anchor="end" font-size="16" fill="#f3f0ff" font-weight="600" font-family="monospace">${code}</text>
    <line x1="${WIDTH - 430}" y1="746" x2="${WIDTH - 160}" y2="746" stroke="#2a2535" stroke-width="1.5"/>
  </g>

  <text x="${WIDTH / 2}" y="792" text-anchor="middle" font-family="Arial, sans-serif" font-size="14" fill="#5a5468">Verifica este certificado en ndemy.com con el código indicado.</text>
</svg>`;
}

// Devuelve una data-URL PNG del certificado (para previsualización o descarga)
export function certificateToPngBlob(cert, scale = 2) {
  return new Promise((resolve, reject) => {
    const svg = buildCertificateSvg(cert);
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      try {
        const canvas = document.createElement('canvas');
        canvas.width = WIDTH * scale;
        canvas.height = HEIGHT * scale;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        URL.revokeObjectURL(url);
        canvas.toBlob(
          (blob) => (blob ? resolve(blob) : reject(new Error('No se pudo generar la imagen'))),
          'image/png'
        );
      } catch (e) {
        URL.revokeObjectURL(url);
        reject(e);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('No se pudo renderizar el certificado'));
    };
    img.src = url;
  });
}

// Descarga el certificado como PNG
export async function downloadCertificate(cert) {
  const blob = await certificateToPngBlob(cert);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const safeCourse = (cert.courseTitle ?? 'curso').replace(/[^\w\-]+/g, '_').slice(0, 40);
  a.href = url;
  a.download = `certificado_${safeCourse}.png`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
