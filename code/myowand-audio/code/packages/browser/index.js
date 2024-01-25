console.log("hello, world!");


let draw;

const HISTORY_LEN = 100;
const history = Array.from({ length: HISTORY_LEN }, () => 0);


let plotLock = false;

function tryDrawPlot(ct, data) {
  if (plotLock) { return; }
  else {
    plotLock = true;
    drawPlot(ct, data).then(() => plotLock = false);
  }
}

let invocationCount = 0;
async function drawPlot(ct, data) {
  console.log(invocationCount);
  invocationCount += 1;
  ct.clearRect(0, -1, 1, 2);
  ct.strokeStyle = 'green';
  ct.lineWidth = 0.001;
  const scale = 15;
  const step = 1/data.length;
  const scaled = data.map(x => x/scale);
  ct.beginPath();
  ct.moveTo(0, scaled[0]);
  for (let i=1; i<scaled.length; i++) {
    ct.lineTo(i*step, scaled[i]);
  }
  ct.stroke();
  ct.closePath();
}



function note(ctx, frequency) {
  console.log(`create note with frequency ${frequency}`);
  const o = new OscillatorNode(ctx, {
    frequency,
  });
  const g = ctx.createGain();
  o.connect(g).connect(ctx.destination);
  return { oscillator: o, gain: g };
}


const ctx = new AudioContext();
const notes = [
  note(ctx, 440),
  note(ctx, 495),
  note(ctx, 557),
  note(ctx, 660),
  note(ctx, 743),
  note(ctx, 880),
];
let lastNote = null;

function stopLastNote() {
  if (lastNote !== null) {
    notes[lastNote].gain.gain.value = 0;
  }
}
function playNote(idx) {
  lastNote = idx;
  notes[idx].gain.gain.value = 1;
}
let playing = false;


window.onload = () => {
  const socket = new WebSocket("ws://localhost:8081/");
  socket.onmessage = e => {
    //console.log(e.data);
    const data = JSON.parse(e.data);
    if (data.active != 1) { stopLastNote(); lastNote = null; return; }
    const idx = data.note;
    //console.log(e.data, idx, typeof(idx));
    stopLastNote();
    playNote(idx);
    history.shift();
    history.push(data.signal);
    tryDrawPlot(draw, history);
  }
};


function startup() {
  const root = document.getElementById('root');
  const canvas = document.createElement('canvas');
  canvas.width = 1000;
  canvas.height = 500;
  while (root.lastChild != null) {
    root.removeChild(root.lastChild);
  }
  root.appendChild(canvas);
  draw = canvas.getContext('2d');
  draw.transform(canvas.width, 0, 0, -canvas.height/2, 0, canvas.height/2);
  draw.clear = function() { canvas.width = canvas.width; }

  drawPlot(draw, history);

  ctx.resume();
  notes.forEach(n => {
    n.oscillator.start();
    n.gain.gain.value = 0;
  });
  playing = true;
  //window.onkeydown = () => { stopLastNote(); lastNote = null; playing = !playing; }
}
