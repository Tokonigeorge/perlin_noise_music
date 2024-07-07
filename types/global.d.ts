export {};

declare global {
  type P5jsContainerRef = HTMLDivElement | null;
  type P5jsSketch = (p: p5Types) => void;
  type P5jsContainer = ({
    sketch,
  }: {
    sketch: P5jsSketch;
  }) => React.JSX.Element;
}
