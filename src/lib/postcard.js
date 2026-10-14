export function wrapLines(measure, text, maxWidth) {
  const words = text.split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? line + ' ' + word : word;
    if (measure(candidate) > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];
export function postmarkLines(date, place) {
  const hours = date.getHours() % 12 || 12;
  const ampm = date.getHours() >= 12 ? 'PM' : 'AM';
  return [
    place,
    MONTHS[date.getMonth()] + ' ' + String(date.getDate()).padStart(2, '0') + ' ' + date.getFullYear(),
    hours + ':' + String(date.getMinutes()).padStart(2, '0') + ' ' + ampm,
  ];
}

export const CARD = { w: 1200, h: 800 };
const SCRIPT = 'italic 54px "Brush Script MT", "Snell Roundhand", "Segoe Script", cursive';
const HAND = '36px "Comic Sans MS", "Comic Neue", cursive';
const MONO = '"Courier New", Courier, monospace';

// The front: the photo edge to edge inside a white border, with a ribbon.
export function drawFront(c, image, ribbon) {
  const { w, h } = CARD;
  c.fillStyle = '#FFFFFF';
  c.fillRect(0, 0, w, h);
  if (image) {
    const border = 24;
    const aw = w - 2 * border;
    const ah = h - 2 * border;
    const scale = Math.max(aw / image.naturalWidth, ah / image.naturalHeight);
    const dw = image.naturalWidth * scale;
    const dh = image.naturalHeight * scale;
    c.save();
    c.beginPath();
    c.rect(border, border, aw, ah);
    c.clip();
    c.drawImage(image, border + (aw - dw) / 2, border + (ah - dh) / 2, dw, dh);
    c.restore();
  }
  c.save();
  c.translate(48, 652);
  c.beginPath();
  c.moveTo(0, 0); c.lineTo(560, 0); c.lineTo(534, 46); c.lineTo(560, 92); c.lineTo(0, 92); c.lineTo(26, 46); c.closePath();
  c.fillStyle = '#FFD54A';
  c.fill();
  c.lineWidth = 4;
  c.strokeStyle = '#000080';
  c.stroke();
  c.fillStyle = '#000080';
  c.font = SCRIPT;
  c.textAlign = 'center';
  c.textBaseline = 'middle';
  c.fillText(ribbon, 280, 48);
  c.restore();
}

// The back: the note on the left, stamp, postmark and address lines on the right.
export function drawBack(c, { note, stamp, date, place, credit }) {
  const { w, h } = CARD;
  c.fillStyle = '#FFFDF5';
  c.fillRect(0, 0, w, h);
  c.strokeStyle = '#CFCFCF';
  c.lineWidth = 2;
  c.strokeRect(14, 14, w - 28, h - 28);
  c.beginPath(); c.moveTo(640, 70); c.lineTo(640, 740); c.stroke();

  c.fillStyle = '#1a1a1a';
  c.font = HAND;
  c.textAlign = 'left';
  c.textBaseline = 'top';
  wrapLines((s) => c.measureText(s).width, note, 530).slice(0, 9).forEach((line, i) => c.fillText(line, 64, 110 + i * 52));

  const sx = 1030, sy = 52, sw = 120, sh = 144;
  c.fillStyle = '#FFFFFF';
  c.fillRect(sx, sy, sw, sh);
  c.setLineDash([6, 6]);
  c.strokeStyle = '#BBBBBB';
  c.lineWidth = 3;
  c.strokeRect(sx, sy, sw, sh);
  c.setLineDash([]);
  if (stamp) {
    c.imageSmoothingEnabled = false;
    c.drawImage(stamp, sx + 12, sy + 12, 96, 96);
    c.imageSmoothingEnabled = true;
  }
  c.fillStyle = '#000080';
  c.font = 'bold 12px "Comic Sans MS", "Comic Neue", cursive';
  c.textAlign = 'center';
  c.fillText('ROOFTOP POST', sx + sw / 2, sy + 124);

  c.strokeStyle = '#444444';
  c.lineWidth = 3;
  c.beginPath(); c.arc(960, 150, 74, 0, Math.PI * 2); c.stroke();
  c.beginPath(); c.arc(960, 150, 60, 0, Math.PI * 2); c.stroke();
  c.fillStyle = '#444444';
  c.font = 'bold 15px ' + MONO;
  c.textBaseline = 'middle';
  postmarkLines(date, place).forEach((line, i) => c.fillText(line, 960, 128 + i * 22));
  for (let i = 0; i < 3; i++) {
    c.beginPath();
    for (let x = 700; x <= 880; x += 6) {
      const y = 128 + i * 22 + Math.sin(x / 9) * 4;
      if (x === 700) c.moveTo(x, y); else c.lineTo(x, y);
    }
    c.stroke();
  }

  c.strokeStyle = '#B5B5B5';
  c.lineWidth = 2;
  [420, 500, 580, 660].forEach((y) => { c.beginPath(); c.moveTo(690, y); c.lineTo(1130, y); c.stroke(); });
  c.fillStyle = '#777777';
  c.font = '20px ' + MONO;
  c.textAlign = 'right';
  c.textBaseline = 'alphabetic';
  c.fillText(credit, 1130, 752);
}
