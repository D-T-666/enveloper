interface PaperFormat {
  name: "A3" | "A4";
  canvas: p5.Graphics;
  padding?: number;
  ppi?: number;
}

interface Picture {
  pimage: p5.Image;
  mode?: "crop" | "stretch" | "padded";
}

interface EnvelopeDimensions {
  width: number;
  height: number;
  overlap: number;
}

const getPaperSizeCM = (
  format: PaperFormat
): { width: number; height: number } => {
  let width: number, height: number;

  switch (format.name) {
    case "A3":
      width = 29.7;
      height = 42.0;
      break;
    case "A4":
      width = 21.0;
      height = 29.7;
  }

  return {
    width,
    height,
  };
};

export const renderEnvelope = (
  p: p5,
  pictures: Picture[],
  paper_format: PaperFormat,
  envelope_dimesnions: EnvelopeDimensions
) => {
  // This function takes in all the necessary
  // parameters and renderes the envelope to a
  // given p5.Graphics object.

  let ppcm = 118.110236;

  let canvas: p5.Graphics = paper_format.canvas;
  let paper_size = getPaperSizeCM(paper_format);
  canvas.resizeCanvas(paper_size.width * ppcm, paper_size.height * ppcm);
  canvas.pixelDensity(1);

  let img: p5.Image[] = pictures.map((a) => a.pimage);

  canvas.background(255);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(
      p
        .createVector(envelope_dimesnions.width, envelope_dimesnions.height)
        .heading()
    );

    canvas.image(
      img[0],
      (-envelope_dimesnions.height * ppcm) / 2,
      (-envelope_dimesnions.width * ppcm) / 2,
      envelope_dimesnions.height * ppcm,
      envelope_dimesnions.width * ppcm
    );

    canvas.image(
      img[1],
      (-envelope_dimesnions.height * ppcm) / 2 -
        envelope_dimesnions.height * ppcm,
      (-envelope_dimesnions.width * ppcm) / 2,
      envelope_dimesnions.height * ppcm,
      envelope_dimesnions.width * ppcm
    );

    canvas.image(
      img[1],
      (-envelope_dimesnions.height * ppcm) / 2 +
        envelope_dimesnions.height * ppcm,
      (-envelope_dimesnions.width * ppcm) / 2,
      envelope_dimesnions.height * ppcm,
      envelope_dimesnions.width * ppcm
    );

    canvas.rotate(p.PI);

    canvas.image(
      img[1],
      (-envelope_dimesnions.height * ppcm) / 2,
      (-envelope_dimesnions.width * ppcm) / 2 -
        envelope_dimesnions.width * ppcm,
      envelope_dimesnions.height * ppcm,
      envelope_dimesnions.width * ppcm
    );

    canvas.image(
      img[1],
      (-envelope_dimesnions.height * ppcm) / 2,
      (-envelope_dimesnions.width * ppcm) / 2 +
        envelope_dimesnions.width * ppcm,
      envelope_dimesnions.height * ppcm,
      envelope_dimesnions.width * ppcm
    );
  }
  canvas.pop();
};
