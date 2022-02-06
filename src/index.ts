import * as p5 from "p5";
import { renderEnvelope } from "./envelope/createEnvelope";
import { previewEnvelope } from "./envelope/previewEnvelope";
import "./sass/style.scss";

new p5((p: p5) => {
  let imgs: p5.Image[];
  let canvas: p5.Graphics;

  p.setup = () => {
    let canvas_width = p.min(
      p.windowWidth / 2,
      (p.windowHeight - 40) / (29.7 / 21)
    );
    p.createCanvas(canvas_width, canvas_width * (29.7 / 21));
    canvas = p.createGraphics(100, 100);
    imgs = [p.createImage(1, 1), p.createImage(1, 1)];

    const img1_mode = <HTMLSelectElement>(
      document.getElementById("image-1-mode")
    );
    const img2_mode = <HTMLSelectElement>(
      document.getElementById("image-2-mode")
    );
    const img1 = <HTMLInputElement>(
      document.getElementById("image-select-1-file")
    );
    const img2 = <HTMLInputElement>(
      document.getElementById("image-select-2-file")
    );
    const paper_format = <HTMLButtonElement>(
      document.getElementById("format-select")
    );
    const width = <HTMLInputElement>document.getElementById("width");
    const height = <HTMLInputElement>document.getElementById("height");
    const overlap = <HTMLInputElement>document.getElementById("overlap");
    const download = <HTMLButtonElement>document.getElementById("download");
    const padding = <HTMLButtonElement>document.getElementById("padding");
    const img1_padding = <HTMLInputElement>(
      document.getElementById("image-1-padding")
    );
    const img2_padding = <HTMLInputElement>(
      document.getElementById("image-2-padding")
    );
    const outline_width = <HTMLInputElement>(
      document.getElementById("outline-width")
    );
    const outline_color = <HTMLInputElement>(
      document.getElementById("outline-color")
    );

    const onChange = () =>
      previewEnvelope(
        p,
        [
          {
            pimage: imgs[0],
            mode: <"crop" | "padded" | "stretch">img1_mode.value,
            padding: Number(img1_padding.value),
          },
          {
            pimage: imgs[1],
            mode: <"crop" | "padded" | "stretch">img2_mode.value,
            padding: Number(img2_padding.value),
          },
        ],
        {
          name: <"A3" | "A4">paper_format.value,
          canvas: p,
          padding: Number(padding.value),
        },
        {
          width: Number(width.value),
          height: Number(height.value),
          overlap: Number(overlap.value),
          outline_width: Number(outline_width.value),
          outline_color: p.color(outline_color.value),
        }
      );

    download.addEventListener("click", () => {
      renderEnvelope(
        p,
        [
          {
            pimage: imgs[0],
            mode: <"crop" | "padded" | "stretch">img1_mode.value,
            padding: Number(img1_padding.value),
          },
          {
            pimage: imgs[1],
            mode: <"crop" | "padded" | "stretch">img2_mode.value,
            padding: Number(img2_padding.value),
          },
        ],
        {
          name: <"A3" | "A4">paper_format.value,
          canvas: canvas,
          padding: Number(padding.value),
        },
        {
          width: Number(width.value),
          height: Number(height.value),
          overlap: Number(overlap.value),
          outline_width: Number(outline_width.value),
          outline_color: p.color(outline_color.value),
        }
      );

      p.save(canvas, "envelope.png");
    });

    assingFileCallback(img1, (data) => {
      const image_options = document
        .getElementById("image-select-1")
        .getElementsByClassName("image-options")[0];

      image_options.classList.remove("hidden");

      const preview = <HTMLImageElement>(
        image_options.getElementsByClassName("preview")[0]
      );

      preview.src = data;

      imgs[0] = p.loadImage(data, onChange);
    });
    assingFileCallback(img2, (data) => {
      const image_options = document
        .getElementById("image-select-2")
        .getElementsByClassName("image-options")[0];

      image_options.classList.remove("hidden");

      const preview = <HTMLImageElement>(
        image_options.getElementsByClassName("preview")[0]
      );

      preview.src = data;

      imgs[1] = p.loadImage(data, onChange);
    });

    [
      img1_mode,
      img2_mode,
      paper_format,
      width,
      height,
      overlap,
      padding,
      img1_padding,
      img2_padding,
      outline_width,
      outline_color,
    ].forEach((element) => {
      element.addEventListener("change", onChange);
    });
  };

  p.draw = () => {
    // previewEnvelope();
  };
}, document.getElementById("preview"));

const assingFileCallback = (
  elt: HTMLInputElement,
  callback: (a: string) => void
) => {
  elt.addEventListener("change", () => {
    // Get the file data if it's there
    const file = elt.files[0];

    // Create a file reader
    const reader = new FileReader();

    reader.addEventListener(
      "load",
      () => callback(String(reader.result)), // Send the
      false
    );

    // If the file data is there, call the reader
    // and ask it to read the data in base64
    if (file) {
      reader.readAsDataURL(file);
    }
  });
};

// =====

// Retistering Service Worker

if ("serviceWorker" in navigator) {
  console.log(process.env.NODE_ENV);
  window.addEventListener("load", () => {
    if (process.env.NODE_ENV === "production")
      navigator.serviceWorker
        .register("./service-worker.js")
        .then((registration) => {
          console.log("SW registered: ", registration);
        })
        .catch((registrationError) => {
          console.log("SW registration failed: ", registrationError);
        });
    else
      navigator.serviceWorker.getRegistrations().then(function (registrations) {
        for (let registration of registrations) {
          registration.unregister();
        }
      });
  });
}
