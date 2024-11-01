import type { IChordName, INote, INoteName, IRect } from ".";

export type IChordInfo = {
  name: IChordName;
  interval: number[];
  notation: string;
};

export const chords: IChordInfo[] = [
  { name: "Major", interval: [0, 4, 7], notation: "maj" },
  { name: "Minor", interval: [0, 3, 7], notation: "min" },
  { name: "5th", interval: [0, 7], notation: "5" },
  { name: "Suspended 2nd", interval: [0, 2, 7], notation: "sus2" },
  { name: "Suspended 4th", interval: [0, 5, 7], notation: "sus4" },
  { name: "7th", interval: [0, 4, 7, 10], notation: "7" },
  { name: "Major 7th", interval: [0, 4, 7, 11], notation: "maj7" },
  { name: "Minor 7th", interval: [0, 3, 7, 10], notation: "m7" },
  { name: "7th Flat 5", interval: [0, 4, 6, 10], notation: "7♭5" },
  { name: "7th Sharp 5", interval: [0, 4, 8, 10], notation: "7♯5" },
  {
    name: "Minor 7th Flat 5th",
    interval: [0, 3, 6, 10],
    notation: "m7♭5",
  },
  { name: "Minor Major 7th", interval: [0, 3, 7, 11], notation: "minmaj7" },
  { name: "7th Suspended 4th", interval: [0, 5, 7, 10], notation: "7sus4" },
  { name: "6th", interval: [0, 4, 7, 9], notation: "6" },
  { name: "Minor 6th", interval: [0, 3, 7, 9], notation: "min6" },
  { name: "6th Add 9", interval: [0, 4, 7, 9, 2], notation: "6add9" },
  { name: "9th", interval: [0, 4, 7, 10, 2], notation: "9" },
  { name: "Major 9th", interval: [0, 4, 7, 11, 2], notation: "maj9" },
  { name: "Minor 9th", interval: [0, 3, 7, 10, 2], notation: "m9" },
  { name: "Minor Major 9th", interval: [0, 3, 7, 11, 2], notation: "minmaj9" },
  { name: "11th", interval: [0, 4, 7, 10, 2, 5], notation: "11" },
  { name: "Major 11th", interval: [0, 4, 7, 11, 2, 5], notation: "maj11" },
  { name: "Minor 11th", interval: [0, 3, 7, 10, 2, 5], notation: "m11" },
  { name: "Diminished", interval: [0, 3, 6], notation: "dim" },
  { name: "Diminished 7th", interval: [0, 3, 6, 9], notation: "dim7" },
  { name: "Diminished Major 7th", interval: [0, 3, 6, 11], notation: "dimM7" },
  { name: "Augmented", interval: [0, 4, 8], notation: "aug" },
  { name: "Augmented Major 7th", interval: [0, 4, 8, 11], notation: "augM7" },
];




export const notesNames: INoteName[] = [
  "C",
  "C#",
  "D",
  "D#",
  "E",
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
];

export const notes: INote[] = [];

export const bottomNote = 21;
export const topNote = 108;

for (let i = bottomNote; i <= topNote; i++) {
  notes.push({
    midi: i,
    black: isBlackKey(i),
    name: getNoteNameFromNumber(i),
    octave: Math.floor(i / 12) - 1
  });
}

export function getMidiFromNote(name: INoteName): number {
  return notesNames.indexOf(name)
}

export function getNoteNameFromNumber(midi: number): INoteName {
  return notesNames[midi % 12]
}

export function isBlackKey(midiPitch: number) {
  let noteMod = midiPitch % 12;

  return (
    noteMod === 1 ||
    noteMod === 3 ||
    noteMod === 6 ||
    noteMod === 8 ||
    noteMod === 10
  );
}

export function getNoteFromMidiNote(note: number) {
  return notes.find((n) => n.midi == note);
}



export function getNumWhiteKeys() {
  let numberOfNotes = topNote - bottomNote;
  let numberOfOctaves = Math.floor(numberOfNotes / 12);
  let numberOfWhiteKeys = numberOfOctaves * 7 + 1;

  if (numberOfNotes % 12 === 0) {
    return numberOfWhiteKeys;
  }

  let noteRemainderBottom = bottomNote + numberOfOctaves * 12 + 1;

  for (let i = noteRemainderBottom; i <= topNote; i++) {
    if (!isBlackKey(i)) {
      numberOfWhiteKeys++;
    }
  }
  return numberOfWhiteKeys
}

export function contains(rect: IRect, x: number, y: number){
  return (
    x >= rect.x && x <= rect.x + rect.w && y >= rect.y && y <= rect.y + rect.h
  );
}


export class CanvasRecorder {
  private recordedBlobs: Blob[];
  private supportedType: string | null;
  private mediaRecorder: MediaRecorder | null;
  private stream: MediaStream;
  private video: HTMLVideoElement;

  constructor(private canvas: HTMLCanvasElement, private videoBitsPerSec: number = 2500000) {
    this.recordedBlobs = [];
    this.supportedType = null;
    this.mediaRecorder = null;
    this.stream = canvas.captureStream();
    this.video = document.createElement('video');
    this.video.style.display = 'none';

    if (!this.stream) {
      throw new Error("Failed to capture canvas stream.");
    }
  }

  private handleDataAvailable(event: BlobEvent) {
    if (event.data && event.data.size > 0) {
      this.recordedBlobs.push(event.data);
    }
  }

  private handleStop(event: Event) {
    console.log('Recorder stopped: ', event);
    const superBuffer = new Blob(this.recordedBlobs, { type: this.supportedType || 'video/webm' });
    this.video.src = URL.createObjectURL(superBuffer);
  }

  public startRecording() {
    const types = [
      "video/webm",
      'video/webm,codecs=vp9',
      'video/vp8',
      "video/webm;codecs=vp8",
      "video/webm;codecs=daala",
      "video/webm;codecs=h264",
      "video/mpeg"
    ];

    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        this.supportedType = type;
        break;
      }
    }

    if (!this.supportedType) {
      console.log("No supported type found for MediaRecorder");
      return;
    }

    const options: MediaRecorderOptions = {
      mimeType: this.supportedType,
      videoBitsPerSecond: this.videoBitsPerSec
    };

    this.recordedBlobs = [];
    try {
      this.mediaRecorder = new MediaRecorder(this.stream, options);
    } catch (e) {
      console.error('Exception while creating MediaRecorder:', e);
      throw new Error('MediaRecorder is not supported by this browser.');
    }


    this.mediaRecorder.onstop = (event) => this.handleStop(event);
    this.mediaRecorder.ondataavailable = (event) => this.handleDataAvailable(event as BlobEvent);
    this.mediaRecorder.start(100); // collect 100ms of data blobs
  }

  public stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      console.log('Recorded Blobs: ', this.recordedBlobs);
      this.video.controls = true;
    }
  }

  public download(fileName: string = 'recording.webm') {
    const blob = new Blob(this.recordedBlobs, { type: this.supportedType || 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 100);
  }
}
