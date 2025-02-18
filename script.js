document.addEventListener('DOMContentLoaded', () => {
    const encodeImageInput = document.getElementById('encode-image');
    const encodeMessageInput = document.getElementById('encode-message');
    const encodePasswordInput = document.getElementById('encode-password');
    const encodeButton = document.getElementById('encode-button');
    const encodedImageContainer = document.getElementById('encoded-image-container');
    const encodeStatus = document.getElementById('encode-status');

    const decodeImageInput = document.getElementById('decode-image');
    const decodePasswordInput = document.getElementById('decode-password');
    const decodeButton = document.getElementById('decode-button');
    const decodedMessage = document.getElementById('decoded-message');
    const decodeStatus = document.getElementById('decode-status');

    // Binary conversion functions
    function stringToBinary(str) {
        let binary = '';
        for (let i = 0; i < str.length; i++) {
            binary += str.charCodeAt(i).toString(2).padStart(8, '0');
        }
        return binary;
    }

    function binaryToString(binary) {
        let str = '';
        for (let i = 0; i < binary.length; i += 8) {
            const charCode = parseInt(binary.substring(i, i + 8), 2);
            str += String.fromCharCode(charCode);
        }
        return str;
    }

    encodeButton.addEventListener('click', () => {
        const imageFile = encodeImageInput.files[0];
        const message = encodeMessageInput.value;
        const password = encodePasswordInput.value;

        if (!imageFile || !message || !password) {
            encodeStatus.textContent = "Please select an image, enter a message, and a password.";
            encodeStatus.classList.add('error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                const binaryMessage = stringToBinary(message);

                // LSB Encoding
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let binaryIndex = 0;

                for (let i = 0; i < data.length; i += 4) {
                    if (binaryIndex < binaryMessage.length) {
                        let r = data[i];
                        let g = data[i + 1];
                        let b = data[i + 2];

                        r = (r & 0xFE) | parseInt(binaryMessage[binaryIndex]);
                        if (binaryIndex + 1 < binaryMessage.length) {
                            g = (g & 0xFE) | parseInt(binaryMessage[binaryIndex + 1]);
                        } else {
                            break;
                        }
                        if (binaryIndex + 2 < binaryMessage.length) {
                            b = (b & 0xFE) | parseInt(binaryMessage[binaryIndex + 2]);
                        } else {
                            break;
                        }

                        data[i] = r;
                        data[i + 1] = g;
                        data[i + 2] = b;

                        binaryIndex += 3;
                    } else {
                        break;
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                const encodedImage = canvas.toDataURL();
                encodedImageContainer.innerHTML = `<img src="${encodedImage}">`;
                encodeStatus.textContent = "Image encoded successfully! (Right-click to save)";
                encodeStatus.classList.remove('error');
                encodeStatus.classList.add('success');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageFile);
    });

    decodeButton.addEventListener('click', () => {
        const imageFile = decodeImageInput.files[0];
        const password = decodePasswordInput.value;

        if (!imageFile || !password) {
            decodeStatus.textContent = "Please select an image and enter the password.";
            decodeStatus.classList.add('error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);

                // LSB Decoding
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                let binaryMessage = "";

                for (let i = 0; i < data.length; i += 4) {
                    let binaryChunk = "";
                    for (let j = 0; j < 3; j++) {
                        binaryChunk += (data[i + j] & 0x01);
                    }
                    binaryMessage += binaryChunk;
                }

                const extractedMessage = binaryToString(binaryMessage);

                decodedMessage.textContent = extractedMessage;
                decodeStatus.textContent = "Message decoded successfully!";
                decodeStatus.classList.remove('error');
                decodeStatus.classList.add('success');
            };
            img.src = event.target.result;
        };
        reader.readAsDataURL(imageFile);
    });
});