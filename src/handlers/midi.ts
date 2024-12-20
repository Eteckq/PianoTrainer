import {
  NoteOrigin,
  emitNoteOff,
  emitNoteOn,
  emitSustainOn,
  emitSustainOff,
  on,
} from "../NoteHandler";

export interface OutputWithOrigins {
  device: MIDIOutput;
  origins: NoteOrigin[];
}

export interface Input {
  device: MIDIInput;
}

let outputsActivated: OutputWithOrigins[] = [];
let inputsActivated: Input[] = [];
let webmidi: MIDIAccess | undefined;

async function initMidiHandler() {
  webmidi = await navigator.requestMIDIAccess();

  webmidi.inputs.forEach((device) => {
    enableInput(device);
  });
  webmidi.outputs.forEach((device) => {
    enableOutput(device);
  });

  webmidi.addEventListener("statechange", (event: MIDIConnectionEventInit) => {
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
    sendNote(note, vel, origin);
  });
  on("note:off", (note, origin) => {
    sendNoteOff(note, origin);
  });
}

function enableOutput(device: MIDIOutput): void {
  if (outputsActivated.some((d) => d.device.id === device.id)) return;
  outputsActivated.push({
    device: device,
    origins: [NoteOrigin.APP, NoteOrigin.MOUSE],
  });
}

function enableInput(device: MIDIInput): void {
  if (inputsActivated.some((d) => d.device.id === device.id)) return;
  inputsActivated.push({ device });

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
      setTimeout(() => {
        emitNoteOff(noteNumber, NoteOrigin.DEVICE);
      }, 700);
    } else if (cmd === 11 && noteNumber === 64) {
      if (vel > 0) {
        emitSustainOn(NoteOrigin.DEVICE);
      } else {
        emitSustainOff(NoteOrigin.DEVICE);
      }
    }
  };
}

function sendNote(note: number, vel: number, origin: NoteOrigin): void {
  // Object.values(NoteOrigin).forEach((key, index) => {
  //   console.log(`${key} has index ${index}`)
  // })
  outputsActivated
    .filter((d) => d.origins.includes(origin))
    .forEach((device) => {
      device.device.send([0x90, note, vel]);
    });
}

function sendNoteOff(note: number, origin: NoteOrigin): void {
  sendNote(note, 0, origin);
}

function disableOutput(id: string): void {
  outputsActivated = outputsActivated.filter(
    (device) => device.device.id !== id
  );
}

function disableInput(id: string): void {
  const deviceToDisable = inputsActivated.find(
    (device) => device.device.id === id
  );
  if (!deviceToDisable) return;

  deviceToDisable.device.onmidimessage = null;
  inputsActivated = inputsActivated.filter((device) => device.device.id !== id);
}

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
  sendNoteOff,
};
