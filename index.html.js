const namespace = 'http://www.w3.org/2000/svg';

const stroke = '#222';
const strokeLight = '#ccc';
const strokeWidth = 3;

const padding = 64;
const textPad = 8;

const colors = [
  '#222222',
  '#cc4444',
  '#44cc44',
  '#4444cc',
  '#44cccc',
  '#cccc44',
  '#cc44cc',
];

function updateSVG () {
  diagram.innerHTML = '';
  var colorIndex = 0;

  const size = Math.min (diagram.clientWidth, diagram.clientHeight);

  const radius = (size - padding) / 2;
  const center = size / 2;

  const svg = document.createElementNS (namespace, 'svg');
  svg.setAttribute ('xmlns', namespace);
  svg.setAttribute ('width', size);
  svg.setAttribute ('height', size);

  const xaxis = document.createElementNS (namespace, 'line');
  xaxis.setAttribute ('x1', center - radius);
  xaxis.setAttribute ('x2', center + radius);
  xaxis.setAttribute ('y1', center);
  xaxis.setAttribute ('y2', center);
  xaxis.setAttribute ('stroke', strokeLight);
  xaxis.setAttribute ('stroke-width', strokeWidth / 2);
  xaxis.setAttribute ('stroke-linecap', 'round');

  const yaxis = document.createElementNS (namespace, 'line');
  yaxis.setAttribute ('x1', center);
  yaxis.setAttribute ('x2', center);
  yaxis.setAttribute ('y1', center - radius);
  yaxis.setAttribute ('y2', center + radius);
  yaxis.setAttribute ('stroke', strokeLight);
  yaxis.setAttribute ('stroke-width', strokeWidth / 2);
  yaxis.setAttribute ('stroke-linecap', 'round');

  svg.appendChild (xaxis);
  svg.appendChild (yaxis);

  const circle = document.createElementNS (namespace, 'circle');
  circle.setAttribute ('r', radius);
  circle.setAttribute ('cx', center);
  circle.setAttribute ('cy', center);
  circle.setAttribute ('stroke', strokeLight);
  circle.setAttribute ('stroke-width', strokeWidth);
  circle.setAttribute ('fill-opacity', 0);

  svg.appendChild (circle);

  const vectorInput = document.getElementById('input')
                              .value
                              .split ('\n')
                              .map ((s) => s.trim ())
                              .filter ((s) => s);

  var maxMag = 0;
  const vectors = vectorInput.map ((str) => {
    const [name, mag, ang] = str.split (/[=]|[:]|[@]|[∠]/, 3)
                                .map ((s) => s.replace (/°|\[.*\]|[()]/g, '')
                                              .trim ())
                                .map (parseFragment);

    if (isNaN (mag) || isNaN (ang)) {
      return { name: name, x: 0, y: 0 };
    }

    if (Math.abs (mag) > maxMag) {
      maxMag = Math.abs (mag);
    }

    const x = mag * Math.cos (ang * Math.PI / 180);
    const y = mag * Math.sin (ang * Math.PI / 180);

    return { name: name, x: x, y: y };
  });

  const scale = (maxMag) ? radius / maxMag : 0;
  const shouldLabel = document.getElementById ('labels').checked;
  const shouldColor = document.getElementById ('colors').checked;

  vectors.forEach ((vector) => {
    const x2 = center + vector.x * scale;
    const y2 = center + vector.y * -scale;

    const line = document.createElementNS (namespace, 'line');
    line.setAttribute ('x1', center);
    line.setAttribute ('x2', x2);
    line.setAttribute ('y1', center);
    line.setAttribute ('y2', y2);
    line.setAttribute ('stroke', colors[colorIndex]);
    line.setAttribute ('stroke-width', strokeWidth);
    line.setAttribute ('stroke-linecap', 'round');

    svg.appendChild (line);

    if (shouldLabel) {
      const text = document.createElementNS (namespace, 'text');
      text.setAttribute ('x', x2 + ((vector.x > 0) ? textPad : -textPad * 2));
      text.setAttribute ('y', y2 + ((vector.y > 0) ? -textPad : textPad * 2));
      text.setAttribute ('fill', colors[colorIndex]);
      text.textContent = vector.name;

      svg.appendChild (text);
    }

    if (shouldColor) {
      colorIndex++;
      if (colorIndex == colors.length) {
        colorIndex = 0;
      }
    }
  });

  diagram.appendChild (svg);
}

function downloadSVG () {
  const encoding = btoa (diagram.innerHTML);
  const dummyLink = document.createElement ('a');

  dummyLink.download = 'phasor-diagram.svg';
  dummyLink.target = '_blank';
  dummyLink.href = 'data:image/svg+xml;base64,' + encoding;
  dummyLink.dispatchEvent (new MouseEvent ('click'));
}

function parseFragment (frag) {
  if (frag.substring (0, 1) == '−') {
    return -1 * Number (frag.substring (1, frag.length));
  } else if (isNaN (frag)) {
    return frag;
  } else {
    return Number (frag);
  }
}
