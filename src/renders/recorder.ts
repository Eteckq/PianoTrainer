import 
 { CanvasRecorder } from "../utils";

let isRecording = ref(false);
let recorder: CanvasRecorder | null = null;
let pianoRecorder: CanvasRecorder | null = null;

function record(visualizerCanvas: HTMLCanvasElement, pianoCanvas: HTMLCanvasElement) {
  if (isRecording.value && recorder && pianoRecorder) {
    recorder.stopRecording();
    recorder.download("visualizer");
    pianoRecorder.stopRecording();
    pianoRecorder.download("keyboard");
    isRecording.value = false;
  } else {
    recorder = new CanvasRecorder(visualizerCanvas);
    pianoRecorder = new CanvasRecorder(pianoCanvas);
    recorder.startRecording();
    pianoRecorder.startRecording();
    isRecording.value = true;
  }
}

export {
    record,
    isRecording
}