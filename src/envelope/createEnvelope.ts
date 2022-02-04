import e = require("express");
import { EnvelopeDimensions, PaperFormat, Picture } from "./types";

export const getPaperSizeCM = (
  format: PaperFormat,
  padding?: boolean
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

  if (padding) {
    width -= format.padding * 2;
    height -= format.padding * 2;
  }

  return {
    width,
    height,
  };
};

export const getCroppedImage = (img: p5.Image, w2h_ratio: number) => {
  if (w2h_ratio > img.width / img.height) {
    return img.get(
      0,
      (img.height - img.width / w2h_ratio) / 2,
      img.width,
      img.width / w2h_ratio
    );
  } else {
    return img.get(
      (img.width - img.height * w2h_ratio) / 2,
      0,
      img.height * w2h_ratio,
      img.height
    );
  }
};

export const getPaddedImage = (img: p5.Image, w2h_ratio: number) => {
  return w2h_ratio > img.width / img.height
    ? img.get(
        (img.width - img.height * w2h_ratio) / 2,
        0,
        img.height * w2h_ratio,
        img.height
      )
    : img.get(
        0,
        (img.height - img.width / w2h_ratio) / 2,
        img.width,
        img.width / w2h_ratio
      );
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

  let canvas: p5.Graphics | p5 = paper_format.canvas;
  let paper_size = getPaperSizeCM(paper_format, true);
  const ppw = paper_size.width * ppcm - 2 * paper_format.padding;
  const pph = paper_size.height * ppcm - 2 * paper_format.padding;
  canvas.resizeCanvas(ppw, pph);
  canvas.pixelDensity(1);
  let pw = envelope_dimesnions.width * ppcm;
  let ph = envelope_dimesnions.height * ppcm;

  let e_ratio = envelope_dimesnions.width / envelope_dimesnions.height;

  let img: p5.Image[] = pictures.map((a) => {
    switch (a.mode) {
      case "crop":
        return getCroppedImage(a.pimage, e_ratio);
      case "padded":
        return getPaddedImage(a.pimage, e_ratio);
      case "stretch":
        return a.pimage;
    }
  });

  let main_angle = p.createVector(pw, ph);

  // canvas.background(255);
  canvas.clear(255, 255, 255, 60);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(p.HALF_PI - main_angle.heading());

    // Draw the main pictures
    {
      canvas.image(img[0], -pw / 2, -ph / 2, pw, ph);

      // TODO: Handle the drawing of the other side of the envelope (the flaps)
      canvas.image(img[1], -pw / 2 - pw, -ph / 2, pw, ph);

      canvas.image(img[1], -pw / 2 + pw, -ph / 2, pw, ph);

      canvas.rotate(p.PI);

      canvas.image(img[1], -pw / 2, -ph / 2 - ph, pw, ph);

      canvas.image(img[1], -pw / 2, -ph / 2 + ph, pw, ph);

      canvas.push();
      {
        const _size =
          ((envelope_dimesnions.width * envelope_dimesnions.height) /
            p.sqrt(
              envelope_dimesnions.width * envelope_dimesnions.width +
                envelope_dimesnions.height * envelope_dimesnions.height
            )) *
          2;
        canvas.noStroke();
        canvas.rotate(main_angle.heading() - p.HALF_PI);
        canvas.erase();
        canvas.rect(
          ((_size + envelope_dimesnions.overlap) / 2) * ppcm,
          -pph / 2,
          ppw,
          pph
        );
        canvas.rect(
          -((_size + envelope_dimesnions.overlap) / 2) * ppcm - ppw,
          -pph / 2,
          ppw,
          pph
        );
        canvas.rotate(p.HALF_PI - main_angle.heading());
        canvas.rotate(p.HALF_PI - main_angle.heading());
        canvas.rect(
          ((_size + envelope_dimesnions.overlap) / 2) * ppcm,
          -pph / 2,
          ppw,
          pph
        );
        canvas.rect(
          -((_size + envelope_dimesnions.overlap) / 2) * ppcm - ppw,
          -pph / 2,
          ppw,
          pph
        );
        canvas.rotate(main_angle.heading() - p.HALF_PI);

        // Rounded corners
        {
          let sw = envelope_dimesnions.overlap * ppcm;
          canvas.noFill();
          canvas.strokeCap(p.SQUARE);
          canvas.stroke(255);
          canvas.strokeWeight(sw);

          canvas.arc(
            0,
            ph,
            envelope_dimesnions.overlap * ppcm + sw,
            envelope_dimesnions.overlap * ppcm + sw,
            p.HALF_PI - main_angle.heading(),
            main_angle.heading() + p.HALF_PI
          );

          canvas.arc(
            0,
            -ph,
            envelope_dimesnions.overlap * ppcm + sw,
            envelope_dimesnions.overlap * ppcm + sw,
            p.HALF_PI - main_angle.heading() + p.PI,
            main_angle.heading() - p.HALF_PI
          );

          canvas.arc(
            pw,
            0,
            envelope_dimesnions.overlap * ppcm + sw,
            envelope_dimesnions.overlap * ppcm + sw,
            main_angle.heading() - p.HALF_PI,
            p.HALF_PI - main_angle.heading()
          );

          canvas.arc(
            -pw,
            0,
            envelope_dimesnions.overlap * ppcm + sw,
            envelope_dimesnions.overlap * ppcm + sw,
            main_angle.heading() + p.HALF_PI,
            p.HALF_PI - main_angle.heading() + p.PI
          );
        }
        canvas.noErase();
      }
      canvas.pop();
    }
  }
  canvas.pop();
};
