import {
  drawEnvelopeOutlines,
  drawImagesEnvelope,
  getImagesFromPictures,
  getPaperSizeCM,
} from "./createEnvelope";
import { EnvelopeParameters, PaperFormat, Picture } from "./types";

export const previewEnvelope = (
  p: p5,
  pictures: Picture[],
  paper_format: PaperFormat,
  envelope_dimesnions: EnvelopeParameters
) => {
  // This function takes in all the necessary
  // parameters and renderes the envelope to a
  // given p5.Graphics object.

  let canvas: p5.Graphics | p5 = paper_format.canvas;
  let paper_size = getPaperSizeCM(paper_format);
  const p_ratio = paper_size.height / paper_size.width;
  const ppw = canvas.width;
  const pph = ppw * p_ratio;

  canvas.resizeCanvas(ppw, pph);

  let ppcm = ppw / paper_size.width;
  const pw = envelope_dimesnions.width * ppcm;
  const ph = envelope_dimesnions.height * ppcm;

  let main_angle = p.createVector(pw, ph);

  canvas.background(255);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(p.HALF_PI - main_angle.heading());

    {
      drawImagesEnvelope(p, canvas, pictures, envelope_dimesnions, ppcm);
      drawEnvelopeOutlines(p, canvas, envelope_dimesnions, ppcm);
    }

    // Draw the main pictures
    {
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

  // borders
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

  // paper padding
  canvas.noStroke();
  canvas.fill(255, 0, 0, 20);
  canvas.rect(0, 0, ppw, paper_format.padding * ppcm);
  canvas.rect(
    0,
    pph - paper_format.padding * ppcm,
    ppw,
    paper_format.padding * ppcm
  );
  canvas.rect(
    0,
    paper_format.padding * ppcm,
    paper_format.padding * ppcm,
    pph - paper_format.padding * ppcm * 2
  );
  canvas.rect(
    ppw - paper_format.padding * ppcm,
    paper_format.padding * ppcm,
    paper_format.padding * ppcm,
    pph - paper_format.padding * ppcm * 2
  );
};
