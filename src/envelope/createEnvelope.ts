import e = require("express");
import { EnvelopeParameters, PaperFormat, Picture } from "./types";

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

export const getImageFromPicture = (picture: Picture, wh_ratio: number) => {
  switch (picture.mode) {
    case "crop":
      return getCroppedImage(picture.pimage, wh_ratio);
    case "padded":
      return getPaddedImage(picture.pimage, wh_ratio);
    case "stretch":
      return picture.pimage;
  }
};

export const getImagesFromPictures = (
  pictures: Picture[],
  output_w_cm: number,
  output_h_cm: number,
  ppcm?: number
): p5.Image[] => {
  return pictures.map((a) => {
    return getImageFromPicture(
      a,
      (output_w_cm - a.padding * 2) / (output_h_cm - a.padding * 2)
    );
  });
};

export const drawEnvelopeOutlines = (
  p: p5,
  canvas: p5 | p5.Graphics,
  envelope_params: EnvelopeParameters,
  ppcm: number
) => {
  const sw = envelope_params.outline_width * ppcm;
  const pw = envelope_params.width * ppcm;
  const ph = envelope_params.height * ppcm;
  const ratio = pw / ph;
  const overlap = envelope_params.overlap * ppcm;

  canvas.stroke(envelope_params.outline_color);
  canvas.strokeWeight(sw);
  canvas.noFill();

  // boxes around the pictures
  canvas.rect(sw / 2 - pw / 2, sw / 2 - ph / 2, pw - sw, ph - sw);
  canvas.rect(sw / 2 - pw / 2 - pw, sw / 2 - ph / 2, pw - sw, ph - sw);
  canvas.rect(sw / 2 - pw / 2 + pw, sw / 2 - ph / 2, pw - sw, ph - sw);
  canvas.rect(sw / 2 - pw / 2, sw / 2 - ph / 2 - ph, pw - sw, ph - sw);
  canvas.rect(sw / 2 - pw / 2, sw / 2 - ph / 2 + ph, pw - sw, ph - sw);

  const vl = p.sqrt(1 + (1 / ratio) * (1 / ratio)) / 2;
  const hl = p.sqrt(1 + 1 * ratio * (1 * ratio)) / 2;
  const pvl = vl * overlap,
    phl = hl * overlap;
  const vsw = sw / 2;
  const hsw = vsw * (ratio - 1);
  const ratio_v = p.createVector(pw, ph);
  const a = ratio_v.heading();
  const r = overlap + sw;

  canvas.strokeCap(p.ROUND);
  // straight lines
  {
    // top right
    canvas.line(pw / 2 - vsw, -(ph / 2 + pvl) + hsw, -vsw, -ph - pvl + hsw);
    // top left
    canvas.line(-pw / 2 + vsw, -(ph / 2 + pvl) + hsw, vsw, -ph - pvl + hsw);

    // bottom right
    canvas.line(pw / 2 - vsw, ph / 2 + pvl - hsw, -vsw, ph + pvl - hsw);
    // bottom left
    canvas.line(-pw / 2 + vsw, ph / 2 + pvl - hsw, vsw, ph + pvl - hsw);

    // right top
    canvas.line(pw / 2 + phl - hsw, -ph / 2 + vsw, pw + phl - hsw, vsw);
    // right bottm
    canvas.line(pw / 2 + phl - hsw, ph / 2 - vsw, pw + phl - hsw, -vsw);

    // left top
    canvas.line(-pw / 2 - phl + hsw, -ph / 2 + vsw, -pw - phl + hsw, vsw);
    // left bottm
    canvas.line(-pw / 2 - phl + hsw, ph / 2 - vsw, -pw - phl + hsw, -vsw);
  }
  // gay lines
  canvas.arc(0, ph - sw, r, r, p.HALF_PI - a, a + p.HALF_PI);
  canvas.arc(0, -ph + sw, r, r, p.HALF_PI - a + p.PI, a - p.HALF_PI);
  canvas.arc(pw - sw, 0, r, r, a - p.HALF_PI, p.HALF_PI - a);
  canvas.arc(-pw + sw, 0, r, r, a + p.HALF_PI, p.HALF_PI - a + p.PI);
};

export const drawImagesEnvelope = (
  p: p5,
  canvas: p5 | p5.Graphics,
  pictures: Picture[],
  envelope_params: EnvelopeParameters,
  ppcm: number
) => {
  const img: p5.Image[] = getImagesFromPictures(
    pictures,
    envelope_params.width,
    envelope_params.height
  );
  const pd: number[] = pictures.map((a) => a.padding * ppcm);
  const pw = envelope_params.width * ppcm;
  const ph = envelope_params.height * ppcm;
  const ipw: number[] = pd.map((a) => pw - a * 2);
  const iph: number[] = pd.map((a) => ph - a * 2);
  const ipx: number[] = pd.map((a) => a - pw / 2);
  const ipy: number[] = pd.map((a) => a - ph / 2);

  canvas.image(img[0], ipx[0], ipy[0], ipw[0], iph[0]);

  canvas.image(img[1], ipx[1] - pw, ipy[1], ipw[1], iph[1]);
  canvas.image(img[1], ipx[1] + pw, ipy[1], ipw[1], iph[1]);

  canvas.rotate(p.PI);

  canvas.image(img[1], ipx[1], ipy[1] - ph, ipw[1], iph[1]);
  canvas.image(img[1], ipx[1], ipy[1] + ph, ipw[1], iph[1]);

  canvas.rotate(-p.PI);

  // Outlines
  canvas.noFill();
  // canvas.fill(255, 0, 255);
  let sw: number;
  sw = pictures[0].outline_width * ppcm;
  canvas.strokeWeight(sw);
  canvas.stroke(pictures[0].outline_color);
  canvas.rect(ipx[0] + sw / 2, ipy[0] + sw / 2, ipw[0] - sw, iph[0] - sw);

  sw = pictures[1].outline_width * ppcm;
  canvas.strokeWeight(pictures[1].outline_width * ppcm);
  canvas.stroke(pictures[1].outline_color);
  canvas.rect(ipx[1] + sw / 2 - pw, ipy[1] + sw / 2, ipw[1] - sw, iph[1] - sw);
  canvas.rect(ipx[1] + sw / 2 + pw, ipy[1] + sw / 2, ipw[1] - sw, iph[1] - sw);
  canvas.rect(ipx[1] + sw / 2, ipy[1] + sw / 2 - ph, ipw[1] - sw, iph[1] - sw);
  canvas.rect(ipx[1] + sw / 2, ipy[1] + sw / 2 + ph, ipw[1] - sw, iph[1] - sw);
};

export const renderEnvelope = (
  p: p5,
  pictures: Picture[],
  paper_format: PaperFormat,
  envelope_params: EnvelopeParameters
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
  let pw = envelope_params.width * ppcm;
  let ph = envelope_params.height * ppcm;

  let main_angle = p.createVector(pw, ph);

  canvas.background(255);
  // canvas.clear(255, 255, 255, 60);

  canvas.push();
  {
    canvas.translate(canvas.width / 2, canvas.height / 2);
    canvas.rotate(p.HALF_PI - main_angle.heading());

    {
      drawImagesEnvelope(p, canvas, pictures, envelope_params, ppcm);
      drawEnvelopeOutlines(p, canvas, envelope_params, ppcm);
    }

    {
      const _size =
        ((envelope_params.width * envelope_params.height) /
          p.sqrt(
            envelope_params.width * envelope_params.width +
              envelope_params.height * envelope_params.height
          )) *
        2;
      canvas.noStroke();
      canvas.rotate(main_angle.heading() - p.HALF_PI);
      canvas.fill(255);
      canvas.erase();
      canvas.rect(
        ((_size + envelope_params.overlap) / 2) * ppcm,
        -pph / 2,
        ppw,
        pph
      );
      canvas.rect(
        -((_size + envelope_params.overlap) / 2) * ppcm - ppw,
        -pph / 2,
        ppw,
        pph
      );
      canvas.rotate(p.HALF_PI - main_angle.heading());
      canvas.rotate(p.HALF_PI - main_angle.heading());
      canvas.rect(
        ((_size + envelope_params.overlap) / 2) * ppcm,
        -pph / 2,
        ppw,
        pph
      );
      canvas.rect(
        -((_size + envelope_params.overlap) / 2) * ppcm - ppw,
        -pph / 2,
        ppw,
        pph
      );
      canvas.rotate(main_angle.heading() - p.HALF_PI);

      // Rounded corners
      {
        let sw = envelope_params.overlap * ppcm;
        canvas.noFill();
        canvas.strokeCap(p.SQUARE);
        canvas.stroke(255);
        canvas.strokeWeight(sw);

        canvas.arc(
          0,
          ph,
          envelope_params.overlap * ppcm + sw,
          envelope_params.overlap * ppcm + sw,
          p.HALF_PI - main_angle.heading(),
          main_angle.heading() + p.HALF_PI
        );

        canvas.arc(
          0,
          -ph,
          envelope_params.overlap * ppcm + sw,
          envelope_params.overlap * ppcm + sw,
          p.HALF_PI - main_angle.heading() + p.PI,
          main_angle.heading() - p.HALF_PI
        );

        canvas.arc(
          pw,
          0,
          envelope_params.overlap * ppcm + sw,
          envelope_params.overlap * ppcm + sw,
          main_angle.heading() - p.HALF_PI,
          p.HALF_PI - main_angle.heading()
        );

        canvas.arc(
          -pw,
          0,
          envelope_params.overlap * ppcm + sw,
          envelope_params.overlap * ppcm + sw,
          main_angle.heading() + p.HALF_PI,
          p.HALF_PI - main_angle.heading() + p.PI
        );
      }
      canvas.noErase();
    }
  }
  canvas.pop();
};
