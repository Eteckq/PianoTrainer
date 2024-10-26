export const useMidiStore = defineStore("midiStore", {
  state: (): {
    outputsActivated: MIDIOutput[];
    inputsActivated: MIDIInput[];
  } => ({
    outputsActivated: [],
    inputsActivated: [],
  }),
  actions: {
    enableOutput(device: MIDIOutput) {
      this.disableOutput(device.id);
      this.outputsActivated.push(device);
    },
    enableInput(device: MIDIInput) {
      this.disableInput(device.id);
      this.inputsActivated.push(device);
    },
    disableOutput(id: string) {
      this.outputsActivated = this.outputsActivated.filter(
        (device) => device.id != id
      );
    },
    disableInput(id: string) {
      this.inputsActivated = this.inputsActivated.filter(
        (device) => device.id != id
      );
    },
  },
});
