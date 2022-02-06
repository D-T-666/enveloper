export interface PaperFormat {
  name: "A3" | "A4";
  canvas: p5.Graphics | p5;
  padding: number;
  ppi?: number;
}

export interface Picture {
  pimage: p5.Image;
  mode: "crop" | "stretch" | "padded";
  padding: number;
}

export interface EnvelopeParameters {
  width: number;
  height: number;
  overlap: number;
  outline_width: number;
  outline_color: p5.Color;
}
