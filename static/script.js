document.addEventListener('DOMContentLoaded', () => {
    console.log("Script loaded successfully!");
    handleInputChange(); // Initialize with default (File)
});

function handleInputChange() {
    console.log("Handling input change...");
    const inputType = document.getElementById('inputType').value;
    const fileInput = document.getElementById('fileInput');
    const webcamInput = document.getElementById('webcamInput');

    fileInput.style.display = inputType === 'file' ? 'block' : 'none';
    webcamInput.style.display = inputType === 'webcam' ? 'block' : 'none';
    document.getElementById('predictButton').style.display = 'none'; // Hide initially
}

function triggerFileUpload() {
    console.log("Triggering file upload...");
    document.getElementById('imageUpload').click();
    document.getElementById('predictButton').style.display = 'block';
}

function startWebcam() {
    console.log("Starting webcam...");
    const video = document.getElementById('webcamVideo');
    const captureButton = document.getElementById('captureButton');
    const resultDiv = document.getElementById('result');

    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia({ video: true })
            .then(stream => {
                console.log("Webcam stream acquired.");
                video.srcObject = stream;
                video.style.display = 'block';
                captureButton.style.display = 'block';
                video.play();
            })
            .catch(err => {
                console.error("Webcam error:", err);
                resultDiv.innerHTML = `<p style="color: red;">Error accessing webcam: ${err.message}</p>`;
            });
    } else {
        console.error("Webcam not supported.");
        resultDiv.innerHTML = '<p style="color: red;">Webcam not supported in this browser.</p>';
    }
    document.getElementById('predictButton').style.display = 'none';
}

function captureWebcam() {
    console.log("Capturing webcam image...");
    const video = document.getElementById('webcamVideo');
    const canvas = document.getElementById('webcamCanvas');
    const context = canvas.getContext('2d');

    context.drawImage(video, 0, 0, 224, 224);
    uploadImageFromCanvas(canvas);
    video.style.display = 'none';
    document.getElementById('captureButton').style.display = 'none';
    document.getElementById('predictButton').style.display = 'block';

    const tracks = video.srcObject.getTracks();
    tracks.forEach(track => track.stop());
}

function uploadImage() {
    console.log("Uploading image...");
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const predictionResultDiv = document.getElementById('predictionResult');
    const predictionText = document.getElementById('predictionText');
    const loading = document.getElementById('loading');
    const progressContainer = document.getElementById('confidenceProgress');
    const progressBar = document.getElementById('progressBar');

    // Show prediction result and hide history if visible
    const historyResultDiv = document.getElementById('historyResult');
    if (historyResultDiv.style.display === 'block') {
        historyResultDiv.style.display = 'none';
        predictionResultDiv.style.display = 'block';
    }

    if (file) {
        loading.style.display = 'block';
        predictionText.innerHTML = ''; // Clear previous text

        // Initialize progress bar
        progressContainer.style.display = 'block'; // Show the progress bar
        progressBar.style.width = '0%'; // Reset to 0%

        // Simulate progress while waiting for response
        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
            if (simulatedProgress < 50) { // Stop at 50% until real value arrives
                simulatedProgress += 5; // Increment by 5% every 100ms
                progressBar.style.width = `${simulatedProgress}%`;
            }
        }, 100); // Update every 100ms

        const formData = new FormData();
        formData.append('file', file);

        fetch('/predict', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                clearInterval(progressInterval); // Stop simulation
                loading.style.display = 'none';
                if (data.error) {
                    console.error("Prediction error:", data.error);
                    predictionText.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    progressContainer.style.display = 'none'; // Hide progress bar on error
                } else {
                    console.log("Prediction success:", data);
                    predictionText.innerHTML = `<p>Prediction: ${data.label} (Confidence: ${data.confidence})</p>`;
                    const fakeResult = document.getElementById('fakeResult');
                    const realResult = document.getElementById('realResult');
                    if (data.label === 'Fake') {
                        fakeResult.style.display = 'block';
                        realResult.style.display = 'none';
                        progressBar.style.backgroundColor = '#d32f2f'; // Red for Fake
                    } else {
                        fakeResult.style.display = 'none';
                        realResult.style.display = 'block';
                        progressBar.style.backgroundColor = '#c2185b'; // Pink for Real
                    }
                    // Update progress bar with final confidence
                    const confidenceValue = parseFloat(data.confidence); // Extract number from "60.79%"
                    progressBar.style.width = `${confidenceValue}%`; // Set final width
                }
                URL.revokeObjectURL(previewImage.src);
            })
            .catch(error => {
                clearInterval(progressInterval); // Stop simulation
                loading.style.display = 'none';
                console.error("Fetch error:", error);
                predictionText.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                progressContainer.style.display = 'none'; // Hide progress bar on error
            });
    } else {
        predictionText.innerHTML = '<p style="color: red;">Please select an image.</p>';
        progressContainer.style.display = 'none'; // Ensure progress bar is hidden
    }
}

// ... (previous functions like handleInputChange, triggerFileUpload, startWebcam remain unchanged)

function uploadImage() {
    console.log("Uploading image...");
    const fileInput = document.getElementById('imageUpload');
    const file = fileInput.files[0];
    const predictionResultDiv = document.getElementById('predictionResult');
    const predictionText = document.getElementById('predictionText');
    const loading = document.getElementById('loading');
    const progressContainer = document.getElementById('confidenceProgress');
    const progressBar = document.getElementById('progressBar');
    const previewImage = document.getElementById('previewImage');
    const confidenceOverlay = document.getElementById('confidenceOverlay');

    const historyResultDiv = document.getElementById('historyResult');
    if (historyResultDiv.style.display === 'block') {
        historyResultDiv.style.display = 'none';
        predictionResultDiv.style.display = 'block';
    }

    if (file) {
        loading.style.display = 'block';
        predictionText.innerHTML = '';

        // Show preview
        const imagePreview = document.getElementById('imagePreview');
        previewImage.src = URL.createObjectURL(file);
        imagePreview.style.display = 'block';

        progressContainer.style.display = 'block';
        progressBar.style.width = '0%';

        let simulatedProgress = 0;
        const progressInterval = setInterval(() => {
            if (simulatedProgress < 50) {
                simulatedProgress += 5;
                progressBar.style.width = `${simulatedProgress}%`;
            }
        }, 100);

        const formData = new FormData();
        formData.append('file', file);

        fetch('/predict', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                clearInterval(progressInterval);
                loading.style.display = 'none';
                if (data.error) {
                    console.error("Prediction error:", data.error);
                    predictionText.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    progressContainer.style.display = 'none';
                    imagePreview.style.display = 'none';
                } else {
                    console.log("Prediction success:", data);
                    predictionText.innerHTML = `<p>Prediction: ${data.label} (Confidence: ${data.confidence})</p>`;
                    const fakeResult = document.getElementById('fakeResult');
                    const realResult = document.getElementById('realResult');
                    const confidenceValue = parseFloat(data.confidence);
                    progressBar.style.width = `${confidenceValue}%`;
                    if (data.label === 'Fake') {
                        fakeResult.style.display = 'block';
                        realResult.style.display = 'none';
                        progressBar.style.backgroundColor = '#d32f2f';
                        confidenceOverlay.style.backgroundColor = `rgba(255, 0, 0, ${confidenceValue / 100})`; // Red overlay
                    } else {
                        fakeResult.style.display = 'none';
                        realResult.style.display = 'block';
                        progressBar.style.backgroundColor = '#c2185b';
                        confidenceOverlay.style.backgroundColor = `rgba(0, 128, 0, ${confidenceValue / 100})`; // Green overlay
                    }
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 3000);
                }
            })
            .catch(error => {
                clearInterval(progressInterval);
                loading.style.display = 'none';
                predictionText.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                progressContainer.style.display = 'none';
                imagePreview.style.display = 'none';
            });
    } else {
        predictionText.innerHTML = '<p style="color: red;">Please select an image.</p>';
        progressContainer.style.display = 'none';
        document.getElementById('imagePreview').style.display = 'none';
    }
}

function uploadImageFromCanvas(canvas) {
    console.log("Uploading image from canvas...");
    const predictionResultDiv = document.getElementById('predictionResult');
    const predictionText = document.getElementById('predictionText');
    const loading = document.getElementById('loading');
    const progressContainer = document.getElementById('confidenceProgress');
    const progressBar = document.getElementById('progressBar');
    const previewImage = document.getElementById('previewImage');
    const confidenceOverlay = document.getElementById('confidenceOverlay');

    loading.style.display = 'block';
    predictionText.innerHTML = '';

    const imagePreview = document.getElementById('imagePreview');
    previewImage.src = canvas.toDataURL('image/jpeg');
    imagePreview.style.display = 'block';

    progressContainer.style.display = 'block';
    progressBar.style.width = '0%';

    let simulatedProgress = 0;
    const progressInterval = setInterval(() => {
        if (simulatedProgress < 50) {
            simulatedProgress += 5;
            progressBar.style.width = `${simulatedProgress}%`;
        }
    }, 100);

    canvas.toBlob(blob => {
        const file = new File([blob], 'webcam_image.jpg', { type: 'image/jpeg' });
        const formData = new FormData();
        formData.append('file', file);

        fetch('/predict', { method: 'POST', body: formData })
            .then(response => response.json())
            .then(data => {
                clearInterval(progressInterval);
                loading.style.display = 'none';
                if (data.error) {
                    console.error("Prediction error:", data.error);
                    predictionText.innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    progressContainer.style.display = 'none';
                    imagePreview.style.display = 'none';
                } else {
                    console.log("Prediction success:", data);
                    predictionText.innerHTML = `<p>Prediction: ${data.label} (Confidence: ${data.confidence})</p>`;
                    const fakeResult = document.getElementById('fakeResult');
                    const realResult = document.getElementById('realResult');
                    const confidenceValue = parseFloat(data.confidence);
                    progressBar.style.width = `${confidenceValue}%`;
                    if (data.label === 'Fake') {
                        fakeResult.style.display = 'block';
                        realResult.style.display = 'none';
                        progressBar.style.backgroundColor = '#d32f2f';
                        confidenceOverlay.style.backgroundColor = `rgba(255, 0, 0, ${confidenceValue / 100})`;
                    } else {
                        fakeResult.style.display = 'none';
                        realResult.style.display = 'block';
                        progressBar.style.backgroundColor = '#c2185b';
                        confidenceOverlay.style.backgroundColor = `rgba(0, 128, 0, ${confidenceValue / 100})`;
                    }
                    setTimeout(() => {
                        progressContainer.style.display = 'none';
                    }, 3000);
                }
            })
            .catch(error => {
                clearInterval(progressInterval);
                loading.style.display = 'none';
                console.error("Fetch error:", error);
                predictionText.innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                progressContainer.style.display = 'none';
                imagePreview.style.display = 'none';
            });
    }, 'image/jpeg', 0.95);
}
function toggleOverlay() {
    const overlayToggle = document.getElementById('overlayToggle');
    const confidenceOverlay = document.getElementById('confidenceOverlay');
    if (overlayToggle.checked) {
        confidenceOverlay.style.display = 'block';
    } else {
        confidenceOverlay.style.display = 'none';
    }
}
confidenceOverlay.style.display = 'block'; // Add after setting backgroundColor