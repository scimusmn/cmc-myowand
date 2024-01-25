console.log("hello, world!");



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
      if (!playing) { return; }
      const idx = Number(e.data);
      console.log(e.data, idx, typeof(idx));
      stopLastNote();
      playNote(idx);
    }


  window.onkeydown = () => {
    ctx.resume();
    notes.forEach(n => {
      n.oscillator.start();
      n.gain.gain.value = 0;
    });
    playing = true;
    window.onkeydown = () => { stopLastNote(); lastNote = null; playing = !playing; }
  };
};
