import { emitNoteOff, emitNoteOn, emitSustainOff, emitSustainOn, NoteOrigin, on } from "./NoteHandler";
// Déclaration des variables d'état
let outputsActivated: MIDIOutput[] = [];
let inputsActivated: MIDIInput[] = [];
let webmidi: MIDIAccess | undefined;

async function initMidiHandler() {
  webmidi = await navigator.requestMIDIAccess();

  webmidi.inputs.forEach((device) => {
    enableInput(device);
  });
  webmidi.outputs.forEach((device) => {
    enableOutput(device);
  });

  webmidi.addEventListener("statechange", (event: MIDIConnectionEvent) => {
    if (!event.port) return;

    if (event.port.state === "disconnected") {
      if (event.port.type === "output") {
        disableOutput(event.port.id);
      } else {
        disableInput(event.port.id);
      }
    }
  });

  on("note:on", (note, vel, origin) => {
    if (origin !== NoteOrigin.DEVICE) sendNote(note, vel);
  });
  on("note:off", (note, origin) => {
    if (origin !== NoteOrigin.DEVICE) sendNoteOff(note);
  });
}

function enableOutput(device: MIDIOutput): void {
  if (outputsActivated.some((d) => d.id === device.id)) return;
  outputsActivated.push(device);
}

function enableInput(device: MIDIInput): void {
  if (inputsActivated.some((d) => d.id === device.id)) return;
  inputsActivated.push(device);

  device.onmidimessage = (evt: MIDIMessageEvent) => {
    if (!evt.data) return;
    const channel = evt.data[0] & 0xf;
    const cmd = evt.data[0] >> 4;
    const noteNumber = evt.data[1];
    const vel = evt.data[2];

    if (cmd === 8 || (cmd === 9 && vel === 0)) {
      emitNoteOff(noteNumber, NoteOrigin.DEVICE);
    } else if (cmd === 9) {
      emitNoteOn(noteNumber, vel, NoteOrigin.DEVICE);
    } else if (cmd === 11 && noteNumber === 64) {
      if (vel > 0) {
        emitSustainOn(NoteOrigin.DEVICE);
      } else {
        emitSustainOff(NoteOrigin.DEVICE);
      }
    }
  };
}

function sendNote(note: number, vel: number): void {
  outputsActivated.forEach((device) => {
    device.send([0x90, note, vel]);
  });
}

function sendNoteOff(note: number): void {
  sendNote(note, 0);
}

function disableOutput(id: string): void {
  outputsActivated = outputsActivated.filter((device) => device.id !== id);
}

function disableInput(id: string): void {
  const deviceToDisable = inputsActivated.find((device) => device.id === id);
  if (!deviceToDisable) return;

  deviceToDisable.onmidimessage = null;
  inputsActivated = inputsActivated.filter((device) => device.id !== id);
}

// Initialisation du gestionnaire MIDI
initMidiHandler();

export {
  inputsActivated,
  outputsActivated,
  webmidi,
  enableOutput,
  enableInput,
  disableInput,
  disableOutput,
  sendNote,
  sendNoteOff
}