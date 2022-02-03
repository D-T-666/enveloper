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

  let img: p5.Image[] = pictures.map((a) => a.pimage);

  let main_angle = p.createVector(pw, ph);

  // canvas.background(255);
  canvas.clear(255, 255, 255, 60);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(p.HALF_PI - main_angle.heading());

    // Draw the main pictures
    {
      let e_ratio = envelope_dimesnions.width / envelope_dimesnions.height;
      if (pictures[0].mode === "crop") {
        let img_crop: any;
        let cw: number, ch: number;

        canvas.push();

        if (img[0].width > img[0].height) {
          if (e_ratio > img[0].width / img[0].height) {
            img_crop = img[0].get(
              0,
              (img[0].height - img[0].width / e_ratio) / 2,
              img[0].width,
              img[0].width / e_ratio
            );
          } else {
            img_crop = img[0].get(
              (img[0].width - img[0].height * e_ratio) / 2,
              0,
              img[0].height * e_ratio,
              img[0].height
            );
          }
          cw = pw;
          ch = ph;
        } else {
          if (e_ratio > img[0].height / img[0].width) {
            img_crop = img[0].get(
              (img[0].width - img[0].height / e_ratio) / 2,
              0,
              img[0].height / e_ratio,
              img[0].height
            );
          } else {
            img_crop = img[0].get(
              0,
              (img[0].height - img[0].width * e_ratio) / 2,
              img[0].width,
              img[0].width * e_ratio
            );
          }
          cw = ph;
          ch = pw;
          canvas.rotate(-p.HALF_PI);
        }
        canvas.image(img_crop, -cw / 2, -ch / 2, cw, ch);
        canvas.pop();
      } else if (pictures[0].mode === "padded") {
        // TODO: implement this mode
        // This currently kinda works, needs minor fixing up
        // ---
        // let e_ratio = envelope_dimesnions.width / envelope_dimesnions.height;
        // let cw: number, ch: number;
        // canvas.push();
        // canvas.fill(255, 0, 0);
        // canvas.rect(-pw / 2, -ph / 2, pw, ph);
        // if (img[0].width > img[0].height) {
        //   let i_ratio = img[0].width / img[0].height;
        //   cw = pw;
        //   ch = ph;
        //   if (e_ratio > i_ratio) {
        //     canvas.image(
        //       img[0],
        //       (-ch * i_ratio) / 2,
        //       -ch / 2,
        //       ch * i_ratio,
        //       ch
        //     );
        //   } else {
        //     canvas.image(img[0], -cw / 2, -cw / i_ratio / 2, cw, cw / i_ratio);
        //   }
        // } else {
        //   let i_ratio = img[0].height / img[0].width;
        //   cw = ph;
        //   ch = pw;
        //   canvas.rotate(-p.HALF_PI);
        //   if (e_ratio > i_ratio) {
        //     canvas.image(
        //       img[0],
        //       -ch / 2,
        //       (-ch * i_ratio) / 2,
        //       ch,
        //       ch * i_ratio
        //     );
        //   } else {
        //     canvas.image(img[0], -cw / i_ratio / 2, -cw / 2, cw / i_ratio, cw);
        //   }
        // }
        // canvas.pop();
      } else if (pictures[0].mode === "stretch") {
        canvas.image(img[0], -pw / 2, -ph / 2, pw, ph);
      }

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
