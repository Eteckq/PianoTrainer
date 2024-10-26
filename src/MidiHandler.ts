import { noteHandler } from ".";
import { NoteOrigin } from "./NoteHandler";

export class MidiHandler {
  outputsActivated: MIDIOutput[] = [];
  inputsActivated: MIDIInput[] = [];
  webmidi: MIDIAccess | undefined;

  constructor() {
    navigator.requestMIDIAccess().then((wm) => {
      this.webmidi = wm;

      this.webmidi.inputs.forEach((device) => {
        this.enableInput(device);
      });
      this.webmidi.outputs.forEach((device) => {
        this.enableOutput(device);
      });

      this.webmidi.addEventListener("statechange", (event: MIDIConnectionEvent) => {
        if(!event.port) return
        
        if (event.port.state == "disconnected") {
          if (event.port.type == "output") {
            this.disableOutput(event.port.id);
          } else {
            this.disableInput(event.port.id);
          }
        }
      });
    });

    noteHandler.on("note:on", (note, vel, origin) => {
      if (origin != NoteOrigin.DEVICE) this.sendNote(note, vel);
    });
    noteHandler.on("note:off", (note, origin) => {
      if (origin != NoteOrigin.DEVICE) this.sendNoteOff(note);
    });
  }

  enableOutput(device: MIDIOutput): void {
    if (this.outputsActivated.some((d) => d.id === device.id)) return;
    this.outputsActivated.push(device);
  }

  enableInput(device: MIDIInput): void {
    if (this.inputsActivated.some((d) => d.id === device.id)) return;
    this.inputsActivated.push(device);

    // const messages = [0, 0]
    device.onmidimessage = (evt: MIDIMessageEvent) => {
      if (!evt.data) return;
      const channel = evt.data[0] & 0xf;
      const cmd = evt.data[0] >> 4;
      const noteNumber = evt.data[1];
      const vel = evt.data[2];

      if (cmd === 8 || (cmd === 9 && vel === 0)) {
        noteHandler.emitNoteOff(noteNumber, NoteOrigin.DEVICE);
        // console.log('off', noteNumber);
        // messages[1]++
        // console.log(messages);
      } else if (cmd === 9) {
        // console.log('on', noteNumber);
        noteHandler.emitNoteOn(noteNumber, vel, NoteOrigin.DEVICE);
        // messages[0]++
        // console.log(messages);
      } else if (cmd === 11) {
        if (noteNumber === 64) {
          if (vel > 0) {
            // console.log("pressSustain");
            noteHandler.emitSustainOn(NoteOrigin.DEVICE);
          } else {
            // console.log("releaseSustain");
            noteHandler.emitSustainOff(NoteOrigin.DEVICE);
          }
        }
      }
    };
  }

  sendNote(note: number, vel: number): void {
    this.outputsActivated.forEach((device) => {
      device.send([0x90, note, vel]);
    });
  }

  sendNoteOff(note: number): void {
    this.sendNote(note, 0);
  }

  disableOutput(id: string): void {
    this.outputsActivated = this.outputsActivated.filter(
      (device) => device.id !== id
    );
  }

  disableInput(id: string): void {
    const deviceToDisable = this.inputsActivated.find(
      (device) => device.id === id
    );
    if (!deviceToDisable) return;

    deviceToDisable.onmidimessage = null;
    this.inputsActivated = this.inputsActivated.filter(
      (device) => device.id !== id
    );
  }
}
