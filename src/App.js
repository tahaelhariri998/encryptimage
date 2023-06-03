import React, { useState, useRef, useEffect } from 'react';
import { enc, AES } from 'crypto-js';

function App() {
  const [selectedImage, setSelectedImage] = useState(null);
  const [encryptedRedArray, setEncryptedRedArray] = useState(null);
  const [encryptedGreenArray, setEncryptedGreenArray] = useState(null);
  const [encryptedBlueArray, setEncryptedBlueArray] = useState(null);
  const [decryptedImage, setDecryptedImage] = useState(null);
  const canvasRef = useRef(null);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    setSelectedImage(file);
  };

  const handleEncryptImage = () => {
    if (selectedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = URL.createObjectURL(selectedImage);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        // Get the image data
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;

        // Separate RGB values into separate arrays
        const redArray = [];
        const greenArray = [];
        const blueArray = [];
        for (let i = 0; i < data.length; i += 4) {
          redArray.push(data[i]);
          greenArray.push(data[i + 1]);
          blueArray.push(data[i + 2]);
        }

        // Encrypt the RGB arrays
        const encryptedRedArray = AES.encrypt(redArray.join(','), 'my-secret-key').toString();
        const encryptedGreenArray = AES.encrypt(greenArray.join(','), 'my-secret-key').toString();
        const encryptedBlueArray = AES.encrypt(blueArray.join(','), 'my-secret-key').toString();

        setEncryptedRedArray(encryptedRedArray);
        setEncryptedGreenArray(encryptedGreenArray);
        setEncryptedBlueArray(encryptedBlueArray);
      };
    }
  };
const handleDecryptImage = () => {
  if (encryptedRedArray && encryptedGreenArray && encryptedBlueArray) {
    const decryptedRedString = AES.decrypt(encryptedRedArray, 'my-secret-key').toString(enc.Utf8);
    const decryptedGreenString = AES.decrypt(encryptedGreenArray, 'my-secret-key').toString(enc.Utf8);
    const decryptedBlueString = AES.decrypt(encryptedBlueArray, 'my-secret-key').toString(enc.Utf8);

    // Split the decrypted strings into individual data values
    const decryptedRedArray = decryptedRedString.split(',').map(Number);
    const decryptedGreenArray = decryptedGreenString.split(',').map(Number);
    const decryptedBlueArray = decryptedBlueString.split(',').map(Number);

    if (selectedImage) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      const img = new Image();
      img.src = URL.createObjectURL(selectedImage);

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;

        // Create a new ImageData object with the decrypted data
        const decryptedImageData = ctx.createImageData(canvas.width, canvas.height);
        const { data } = decryptedImageData;

        // Combine the decrypted RGB arrays into the ImageData object
        for (let i = 0, j = 0; i < data.length; i += 4, j++) {
          data[i] = decryptedRedArray[j];
          data[i + 1] = decryptedGreenArray[j];
          data[i + 2] = decryptedBlueArray[j];
          data[i + 3] = 255; // Alpha channel
        }

        // Draw the decrypted image on the canvas
        ctx.putImageData(decryptedImageData, 0, 0);

        // Create a new Image object from the canvas
        const decryptedImage = new Image();
        decryptedImage.src = canvas.toDataURL();

        decryptedImage.onload = () => {
          // Display the decrypted image
          setDecryptedImage(decryptedImage);
        };
      };
    }
  }
};


  useEffect(() => {
    // Clear selected image and decrypted image when new image is uploaded
    setEncryptedRedArray(null);
    setEncryptedGreenArray(null);
    setEncryptedBlueArray(null);
    setDecryptedImage(null);
  }, [selectedImage]);

  return (
    <div>
      <input type="file" onChange={handleImageUpload} />
      <button onClick={handleEncryptImage}>Encrypt Image</button>
      <button onClick={handleDecryptImage}>Decrypt Image</button>
      <canvas ref={canvasRef} />
      {encryptedRedArray && <p>Encrypted Red Array: {encryptedRedArray}</p>}
      {encryptedGreenArray && <p>Encrypted Green Array: {encryptedGreenArray}</p>}
      {encryptedBlueArray && <p>Encrypted Blue Array: {encryptedBlueArray}</p>}
      {decryptedImage && <img src={decryptedImage.src} alt="Decrypted Image" />}
    </div>
  );
}

export default App;
