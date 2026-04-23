console.debug("LAB C - finalna wersja");

// ===== PERMISSIONS =====
if ('geolocation' in navigator) {
  navigator.geolocation.getCurrentPosition(() => {}, () => {});
}
if ('Notification' in window) {
  Notification.requestPermission();
}

// ===== MAP =====
const map = L.map('map').setView([52.23, 21.01], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

let marker;

document.getElementById('location-btn').addEventListener('click', () => {
  navigator.geolocation.getCurrentPosition((pos) => {
    const lat = pos.coords.latitude;
    const lng = pos.coords.longitude;

    document.getElementById('coordinates').textContent =
      `Współrzędne: ${lat.toFixed(5)}, ${lng.toFixed(5)}`;

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lng]).addTo(map);

    map.setView([lat, lng], 15);
  });
});

// ===== GLOBAL =====
const puzzleTable = document.getElementById('puzzle-table');

let pieces = [];
let correctPositions = [];

const SIZE = 4;
const SNAP_TOLERANCE = 25;

// ===== EXPORT =====
document.getElementById('export-btn').addEventListener('click', () => {
  html2canvas(document.getElementById('map'), { useCORS: true })
    .then(canvas => {

      const link = document.createElement('a');
      link.download = 'mapa.png';
      link.href = canvas.toDataURL();
      link.click();

      createPuzzle(canvas);
    });
});

// ===== CREATE PUZZLE =====
function createPuzzle(canvas) {

  puzzleTable.innerHTML = '';
  pieces = [];
  correctPositions = [];

  const tableW = puzzleTable.clientWidth;
  const tableH = puzzleTable.clientHeight;

  const pieceW = tableW / SIZE;
  const pieceH = tableH / SIZE;

  const img = canvas.toDataURL();

  for (let i = 0; i < SIZE * SIZE; i++) {

    const row = Math.floor(i / SIZE);
    const col = i % SIZE;

    const piece = document.createElement('div');
    piece.className = 'puzzle-piece';

    piece.style.width = pieceW + 'px';
    piece.style.height = pieceH + 'px';

    piece.style.backgroundImage = `url(${img})`;
    piece.style.backgroundSize = `${tableW}px ${tableH}px`;
    piece.style.backgroundPosition =
      `-${col * pieceW}px -${row * pieceH}px`;

    piece.dataset.index = i;
    piece.dataset.locked = "false";

    correctPositions[i] = {
      left: col * pieceW,
      top: row * pieceH
    };

    piece.style.left = Math.random() * (tableW - pieceW) + 'px';
    piece.style.top = Math.random() * (tableH - pieceH) + 'px';

    piece.addEventListener('mousedown', startDrag);

    puzzleTable.appendChild(piece);
    pieces.push(piece);
  }
}

// ===== DRAG =====
let dragged = null;
let shiftX = 0;
let shiftY = 0;

function startDrag(e) {

  if (e.target.dataset.locked === "true") return;

  e.preventDefault();

  dragged = e.target;

  const rect = dragged.getBoundingClientRect();

  shiftX = e.clientX - rect.left;
  shiftY = e.clientY - rect.top;

  dragged.style.zIndex = 1000;

  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', stopDrag, { once: true });
}

function move(e) {

  if (!dragged) return;

  const tableRect = puzzleTable.getBoundingClientRect();

  let x = e.clientX - tableRect.left - shiftX;
  let y = e.clientY - tableRect.top - shiftY;

  x = Math.max(0, Math.min(x, tableRect.width - dragged.offsetWidth));
  y = Math.max(0, Math.min(y, tableRect.height - dragged.offsetHeight));

  dragged.style.left = x + 'px';
  dragged.style.top = y + 'px';
}

function stopDrag() {

  document.removeEventListener('mousemove', move);

  if (!dragged) return;

  snapIfClose(dragged);

  dragged.style.zIndex = 1;
  dragged = null;

  checkPuzzle();
}

// ===== SNAP =====
function snapIfClose(piece) {

  const idx = Number(piece.dataset.index);
  const correct = correctPositions[idx];

  const currentLeft = parseFloat(piece.style.left);
  const currentTop = parseFloat(piece.style.top);

  const dx = currentLeft - correct.left;
  const dy = currentTop - correct.top;

  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist < SNAP_TOLERANCE) {

    piece.style.left = correct.left + 'px';
    piece.style.top = correct.top + 'px';

    piece.dataset.locked = "true";
    piece.style.cursor = "default";
  }
}

// ===== CHECK =====
function checkPuzzle() {

  let allCorrect = true;

  for (let piece of pieces) {
    if (piece.dataset.locked !== "true") {
      allCorrect = false;
      break;
    }
  }

  if (allCorrect) {

    console.debug("PUZZLE GOTOWE");

    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification("Gratulacje! Puzzle ułożone 🎉");
    } else {
      alert("Gratulacje! Puzzle ułożone!");
    }
  }
}
