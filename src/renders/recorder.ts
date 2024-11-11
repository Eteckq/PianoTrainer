import { AudioRecorder } from "../audio/engine";
import { MidiRecorder } from "../midiRecorder";
import { CanvasRecorder, IRecorder } from "../utils";
import { pianoCanvas } from "./piano";
import { visualizerCanvas } from "./visualizer";

let isRecording = ref(false);
let recorder: IRecorder | null = null;
let audioRecorder: IRecorder | null = null;
let pianoRecorder: IRecorder | null = null;
let midiRecorder: IRecorder | null = null;

export const isRecordingVisualizer = ref(true);
export const isRecordingPinao = ref(true);
export const isRecordingSound = ref(true);
export const isRecordingMidi = ref(true);

function record() {
  if (isRecording.value) return;

  if (isRecordingSound.value) {
    audioRecorder = new AudioRecorder();
    audioRecorder.startRecording();
  }
  if (isRecordingVisualizer.value && visualizerCanvas) {
    recorder = new CanvasRecorder(visualizerCanvas);
    recorder.startRecording();
  }
  if (isRecordingPinao.value && pianoCanvas) {
    pianoRecorder = new CanvasRecorder(pianoCanvas);
    pianoRecorder.startRecording();
  }
  if (isRecordingMidi.value) {
    midiRecorder = new MidiRecorder();
    midiRecorder.startRecording();
  }
  isRecording.value = true;
}

function stopRecording() {
  if (!isRecording.value) return;

  if (isRecordingSound.value && audioRecorder) {
    audioRecorder.stopRecording();
  }
  if (isRecordingVisualizer.value && recorder) {
    recorder.stopRecording();
    recorder.download("visualizer");
  }
  if (isRecordingPinao.value && pianoRecorder) {
    pianoRecorder.stopRecording();
    pianoRecorder.download("keyboard");
  }
  if (isRecordingMidi.value && midiRecorder) {
    midiRecorder.stopRecording();
    midiRecorder.download();
  }
  isRecording.value = false;
}

export { record, stopRecording, isRecording };
