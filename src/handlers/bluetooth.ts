/// <reference types="web-bluetooth" />

const BT_SERVICE = "03b80e5a-ede8-4b33-a751-6ce34ec4c700";
const MIDI_CHARACTERISTIC = "7772e5db-3868-4112-a1a9-f2669d106bf3";

import EventEmitter from "events";

interface IBTNoteHandlerEvents {
  "note:on": (note: number, vel: number) => void;
  "note:off": (note: number) => void;
  "sustain:on": () => void;
  "sustain:off": () => void;
}

export class MidiBTDevice {
  private eventEmitter = new EventEmitter();

  public inputActivated = true;
  public outputActivated = true;

  constructor(
    private device: BluetoothDevice,
    private midiCharacteritic: BluetoothRemoteGATTCharacteristic
  ) {
    midiCharacteritic.addEventListener("characteristicvaluechanged", (e) =>
      this.onCharacteristicValueChanged(e)
    );
  }

  public toggleOutput() {
    this.outputActivated = !this.outputActivated;
  }

  public toggleInput() {
    this.inputActivated = !this.inputActivated;
  }

  private onCharacteristicValueChanged(e: any) {
    if (!this.inputActivated) return;
    const buffer = getBuffer(e.target.value);

    if (buffer[0] >= 0x80 && buffer[0] <= 0xff) {
      if (buffer[2] == 0x80) {
        this.eventEmitter.emit("note:off", buffer[3]);
      } else if (buffer[2] == 0x90) {
        this.eventEmitter.emit("note:on", buffer[3], buffer[4]);
      } else if (buffer[2] == 0xb0) {
        if (buffer[4] == 0x7f) {
          this.eventEmitter.emit("sustain:on");
        } else if (buffer[4] == 0x00) {
          this.eventEmitter.emit("sustain:off");
        }
      }
    } else {
      console.log("TODO: Handle these case from BT keyboard");
    }
  }

  public getName() {
    return this.device.name;
  }

  private writeNote(
    note: number,
    velocity: number,
    mode: "on" | "off",
    chanel = 0
  ) {
    if (chanel > 16) throw new Error("Chanel cannot be superior to 16");

    const arr = new Uint8Array([
      0x80,
      0x80,
      (mode == "on" ? 0x90 : 0x80) + chanel,
      note,
      velocity,
    ]);
    this.write(arr.buffer);
  }

  private write(buffer: ArrayBufferLike) {
    this.midiCharacteritic.writeValue(buffer);
  }

  public emit<K extends keyof IBTNoteHandlerEvents>(
    event: K,
    ...args: Parameters<IBTNoteHandlerEvents[K]>
  ) {
    if (!this.outputActivated) return;
    switch (event) {
      case "note:on":
        this.writeNote(args[0], args[1], "on");
        break;
      case "note:off":
        this.writeNote(args[0], 0, "off");
        break;
      case "sustain:on":
        console.log("TODO: send sustain on to BT keyboard");
        break;
      case "sustain:off":
        console.log("TODO: send sustain off to BT keyboard");
        break;
    }
  }

  on<K extends keyof IBTNoteHandlerEvents>(
    event: K,
    listener: IBTNoteHandlerEvents[K]
  ): void {
    this.eventEmitter.on(event, listener);
  }

  off<K extends keyof IBTNoteHandlerEvents>(
    event: K,
    listener: IBTNoteHandlerEvents[K]
  ): void {
    this.eventEmitter.off(event, listener);
  }
}

async function askBtDevice() {
  const device = await navigator.bluetooth.requestDevice({
    filters: [
      {
        services: [BT_SERVICE],
      },
    ],
  });

  const gatt = await device.gatt?.connect();

  const service = await gatt?.getPrimaryService(BT_SERVICE);
  const characteristic = await service
    ?.getCharacteristic(MIDI_CHARACTERISTIC)
    .then((c) => c.startNotifications());

  if (service && characteristic) {
    const d = new MidiBTDevice(device, characteristic);
    return d;
  }

  throw new Error("Error with the device");
}

function getBuffer(buffer: DataView) {
  const arr = [];
  for (let i = 0; i < buffer.byteLength; i++) {
    arr.push(buffer.getUint8(i));
  }
  return arr;
}

export { askBtDevice };
