 //logic behid the magic

 async function processImage() {
        const fileInput = document.getElementById('upload');
        const targetKB = parseFloat(document.getElementById('targetKB').value);
        const targetWidth = parseInt(document.getElementById('width').value);
        const targetHeight = parseInt(document.getElementById('height').value);

        
    // --- UPDATED ERROR HANDLING ---
    if (!fileInput.files[0]) {
        errorLog.innerText = "> ERROR: UPLOAD_FILE_BRO";
        
        // Force the animation to restart
        errorLog.classList.add('d-none'); // Hide it
        errorLog.classList.remove('error-shake'); // Remove animation
        
        void errorLog.offsetWidth; // This is the "Magic" line (forces reflow)
        
        errorLog.classList.remove('d-none'); // Show it
        errorLog.classList.add('error-shake'); // Re-apply animation
        return;
    }

    // If valid, hide error
    errorLog.classList.add('d-none');
    errorLog.classList.remove('error-shake');

    // ... Rest of your resizing logic ...

    // UI Feedback
        const btn = document.getElementById('processBtn');
        const btnText = document.getElementById('btnText');
        const btnBar = document.getElementById('btnProgressBar');
        btn.disabled = true;
        btnText.innerText = "CALCULATING_OPTIMAL_OUTPUT...";

        const file = fileInput.files[0];
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = async () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');

        // 1. Determine Initial Dimensions
            let finalWidth = targetWidth || img.width;
            let finalHeight = targetHeight || (img.height / img.width) * (targetWidth || img.width);

        // If only Height was provided
            if (targetHeight && !targetWidth) {
                finalWidth = (img.width / img.height) * targetHeight;
                finalHeight = targetHeight;
            }

            let quality = 0.92;
            let scaleFactor = 1.0;
            let blob;
            let iterations = 0;

        // 2. The Execution Loop
            while (iterations < 20) {
                iterations++;
                btnBar.style.width = (iterations * 5) + "%";

                canvas.width = finalWidth * scaleFactor;
                canvas.height = finalHeight * scaleFactor;
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            // Export to JPEG
                blob = await new Promise(res => canvas.toBlob(res, 'image/jpeg', quality));
                let currentKB = blob.size / 1024;

            // --- SMART BRANCHING ---

            // IF NO KB TARGET: Stop immediately after first resize
                if (isNaN(targetKB) || targetKB <= 0) break;

            // IF KB TARGET EXISTS: Check if we are within 3% accuracy
                const accuracy = Math.abs(currentKB - targetKB);
                if (accuracy < (targetKB * 0.03)) break;

            // Adjust based on size
                if (currentKB > targetKB) {
                    if (quality > 0.2) quality -= 0.1; 
                else scaleFactor -= 0.05; // Shrink pixels only if quality is already low
            } else {
                if (quality < 1.0) quality += 0.05; 
                else scaleFactor += 0.1; // Grow pixels if quality is already 100%
            }
            
            await new Promise(r => setTimeout(r, 20));
        }

        // 3. Render Output
        const url = URL.createObjectURL(blob);
        document.getElementById('outputImage').src = url;
        document.getElementById('outputImage').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
        document.getElementById('statsSection').classList.remove('d-none');
        document.getElementById('downloadBtn').href = url;
        
        // Detailed Report
        document.getElementById('stats').innerText = 
    `FINAL_DIM: ${Math.round(canvas.width)}x${Math.round(canvas.height)}PX | ` +
`FINAL_SIZE: ${(blob.size/1024).toFixed(2)}KB`;

btn.disabled = false;
btnText.innerText = "EXECUTE_RESIZE";
btnBar.style.width = "0%";
};
}
    