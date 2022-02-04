import {
  getCroppedImage,
  getPaddedImage,
  getPaperSizeCM,
} from "./createEnvelope";
import { EnvelopeDimensions, PaperFormat, Picture } from "./types";

export const previewEnvelope = (
  p: p5,
  pictures: Picture[],
  paper_format: PaperFormat,
  envelope_dimesnions: EnvelopeDimensions
) => {
  // This function takes in all the necessary
  // parameters and renderes the envelope to a
  // given p5.Graphics object.

  let canvas: p5.Graphics | p5 = paper_format.canvas;
  let paper_size = getPaperSizeCM(paper_format);
  const p_ratio = paper_size.height / paper_size.width;
  const e_ratio = envelope_dimesnions.width / envelope_dimesnions.height;
  const ppw = canvas.width;
  const pph = ppw * p_ratio;
  let ppcm = ppw / paper_size.width;
  const pw = envelope_dimesnions.width * ppcm;
  const ph = envelope_dimesnions.height * ppcm;

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

  canvas.background(255);

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
        canvas.fill(255);
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

  canvas.noFill();
  canvas.stroke(0);
  canvas.rect(0, 0, ppw, pph);
  canvas.stroke(255, 0, 0);
  canvas.rect(
    paper_format.padding * ppcm,
    paper_format.padding * ppcm,
    ppw - 2 * paper_format.padding * ppcm,
    pph - 2 * paper_format.padding * ppcm
  );
};
