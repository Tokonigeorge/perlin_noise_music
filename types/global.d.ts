export {};

declare global {
  type P5jsContainerRef = HTMLDivElement | null;
  type P5jsSketch = (p: p5Types) => void;
  type P5jsContainer = ({
    sketch,
  }: {
    sketch: P5jsSketch;
  }) => React.JSX.Element;
  interface AppState {
    frequencyData: number[];
    amplitudeData: number[];
    isPlaying: boolean;
  }
  interface AppAction {
    type: AppActionKind;
    payload: any;
  }
  interface IP5State {
    angMult: number;
    angTurn: number;
    cols: number;
    rows: number;
    zoff: number;
    particles: any[];
    flowfield: p5Types.Vector[];
    p: number;
    hu: number;
    zOffInc: number;
    inc: number;
    scl: number;
    colorInc: number;
  }
}
