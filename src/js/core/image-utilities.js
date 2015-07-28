export function isPowerOfTwo(length) {
  return (length & (length - 1)) === 0;
}

export function nextHighestPowerOfTwo(length) {
  --length;
  for (let i = 1; i < 32; i <<= 1) {
    length = length | length >> i;
  }
  return length + 1;
}

export function convertImageToPowerOfTwo(image) {
  if (!isPowerOfTwo(image.width) || !isPowerOfTwo(image.height)) {
    const canvas = document.createElement('canvas');
    canvas.width = nextHighestPowerOfTwo(image.width);
    canvas.height = nextHighestPowerOfTwo(image.height);

    const ctx = canvas.getContext('2d');
    ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
    image = document.createElement('img');
    image.src = canvas.toDataURL();

    return new Promise((resolve) => {
      image.onload = function imageLoaded() {
        resolve(image);
      };
    });
  }

  return image;
}

export function loadImageFromUrl(url) {
  return fetch(url)
    .then((response) => response.blob())
    .then((blob) => {
      const image = document.createElement('img');
      image.src = URL.createObjectURL(blob);

      return new Promise((resolve) => {
        image.onload = function imageLoaded() {
          resolve(image);
        };
      });
    });
}
