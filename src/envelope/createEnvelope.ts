import e = require("express");
import { EnvelopeDimensions, PaperFormat, Picture } from "./types";

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
  canvas.resizeCanvas(
    paper_size.width * ppcm - 2 * paper_format.padding,
    paper_size.height * ppcm - 2 * paper_format.padding
  );
  canvas.pixelDensity(1);

  let img: p5.Image[] = pictures.map((a) => a.pimage);

  canvas.background(255);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(
      p
        .createVector(envelope_dimesnions.height, envelope_dimesnions.width)
        .heading()
    );

    // Draw the main pictures
    {
      let pw = envelope_dimesnions.width * ppcm;
      let ph = envelope_dimesnions.height * ppcm;
      if (pictures[0].mode === "crop") {
        let e_ratio = envelope_dimesnions.width / envelope_dimesnions.height;
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
    }
  }
  canvas.pop();
};
