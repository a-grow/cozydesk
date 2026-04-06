export function getDominantColor(imgSrc) {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = imgSrc;
    img.onload = () => {
      const cvs = document.createElement("canvas");
      cvs.width = img.width;
      cvs.height = img.height;
      const ctx = cvs.getContext("2d");
      ctx.drawImage(img, 0, 0);
      try {
        // Sample roughly center
        const data = ctx.getImageData(img.width / 2, img.height / 2, 1, 1).data;
        resolve(`rgb(${data[0]}, ${data[1]}, ${data[2]})`);
      } catch (e) {
        resolve("#ffd899");
      }
    };
    img.onerror = () => resolve("#ffd899");
  });
}
