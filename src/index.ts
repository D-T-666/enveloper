import * as p5 from "p5";
import "./sass/style.scss";

new p5((p) => {
  let imgs: p5.Image[];
  let a3: p5.Graphics;

  p.setup = () => {
    const img1 = <HTMLInputElement>document.getElementById("img-1");
    const img2 = <HTMLInputElement>document.getElementById("img-2");
    const paper_format = <HTMLInputElement>document.getElementById("width");
    const envelope_width = <HTMLInputElement>document.getElementById("height");

    imgs = [];

    assingFileCallback(img1, (data) => {
      (<HTMLLabelElement>(
        document.querySelector("label[for='img-1']")
      )).innerHTML = '<img src="" id="img-1-preview" />';
      const preview_element = <HTMLImageElement>(
        document.getElementById("img-1-preview")
      );
      preview_element.src = data;
      // preview_element.style.display = "unset";
      imgs[0] = p.loadImage(data);
    });
    assingFileCallback(img2, (data) => {
      (<HTMLLabelElement>(
        document.querySelector("label[for='img-2']")
      )).innerHTML = '<img src="" id="img-2-preview" />';
      const preview_element = <HTMLImageElement>(
        document.getElementById("img-2-preview")
      );
      preview_element.src = data;
      // preview_element.style.display = "unset";
      imgs[1] = p.loadImage(data);
    });

    a3 = p.createGraphics(3508, 4960);
  };

  p.draw = () => {
    if (imgs[0]) {
      a3.push();
      a3.background(255);
      a3.translate(a3.width / 2, a3.height / 2);
      a3.rotate(p.createVector(imgs[0].height, imgs[0].width).heading());
      a3.image(imgs[0], -imgs[0].width / 2, -imgs[0].height / 2);

      a3.pop();
      p.image(a3, 0, 0, 100, 100);
      // p.save(a3, "gay.jpg");
      // p.noLoop();
    }
  };
}, document.getElementById("preview-download"));

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
