async function processImage() {
    const fileInput = document.getElementById('upload');
    const targetKB = parseFloat(document.getElementById('targetKB').value);
    const errorLog = document.getElementById('errorLog');
    const btn = document.getElementById('processBtn');
    const btnBar = document.getElementById('btnProgressBar');

    // Reset Error State
    errorLog.classList.add('d-none');
    errorLog.classList.remove('error-shake');

    if (!fileInput.files[0]) {
        void errorLog.offsetWidth; // Force reflow
        errorLog.innerText = "> ERROR: FILE_NOT_SELECTED";
        errorLog.classList.remove('d-none');
        errorLog.classList.add('error-shake');
        return;
    }

    btn.disabled = true;
    document.getElementById('btnText').innerText = "PROCESSING...";
    
    const file = fileInput.files[0];
    const img = new Image();
    img.src = URL.createObjectURL(file);

    img.onload = async () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Initial Dimensions
        let baseW = parseInt(document.getElementById('width').value) || img.width;
        let baseH = parseInt(document.getElementById('height').value) || (img.height / img.width) * baseW;
        if (document.getElementById('height').value && !document.getElementById('width').value) {
            baseW = (img.width / img.height) * baseH;
        }

        let quality = 0.95;
        let scale = 1.0;
        let iterations = 0;
        let blob;

        while (iterations < 25) {
            iterations++;
            btnBar.style.width = (iterations * 4) + "%";

            canvas.width = Math.max(1, baseW * scale);
            canvas.height = Math.max(1, baseH * scale);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

            blob = await new Promise(r => canvas.toBlob(r, 'image/jpeg', quality));
            let currentKB = blob.size / 1024;

            if (isNaN(targetKB) || targetKB <= 0) break; // Exit if only resizing pixels

            // If target met (within 3% buffer)
            if (Math.abs(currentKB - targetKB) < (targetKB * 0.03)) break;

            if (currentKB > targetKB) {
                if (quality > 0.2) quality -= 0.1; 
                else scale *= 0.85; // Switch to pixel reduction if quality fails
            } else {
                if (quality < 0.95) quality += 0.05; 
                else scale *= 1.1; 
            }
            await new Promise(r => setTimeout(r, 10));
        }

        // Output Results
        const url = URL.createObjectURL(blob);
        document.getElementById('outputImage').src = url;
        document.getElementById('outputImage').style.display = 'block';
        document.getElementById('placeholder').style.display = 'none';
        document.getElementById('statsSection').classList.remove('d-none');
        document.getElementById('downloadLink').href = url;
        document.getElementById('stats').innerText = `DATA: ${Math.round(canvas.width)}x${Math.round(canvas.height)}PX @ ${(blob.size/1024).toFixed(2)}KB`;
        
        btn.disabled = false;
        document.getElementById('btnText').innerText = "EXECUTE_RESIZE";
        btnBar.style.width = "0%";
    };
};

//SHOW INPUT SIZE
function showInputSize() {
    const fileInput = document.getElementById('upload');
    const inputStats = document.getElementById('inputStats');
    const sourceSize = document.getElementById('sourceSize');

    if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        const sizeKB = (file.size / 1024).toFixed(2);
        
        sourceSize.innerText = sizeKB;
        inputStats.classList.remove('d-none');
    } else {
        inputStats.classList.add('d-none');
    }
}


//SOFT RESET FUNCTION
function softReset() {
    // 1. Clear Inputs
    document.getElementById('upload').value = "";
    document.getElementById('width').value = "";
    document.getElementById('height').value = "";
    document.getElementById('targetKB').value = "";

    // 2. Hide Output UI
    document.getElementById('statsSection').classList.add('d-none');
    document.getElementById('outputImage').style.display = 'none';
    document.getElementById('placeholder').style.display = 'block';
    
    // 3. Hide Errors
    const errorLog = document.getElementById('errorLog');
    errorLog.classList.add('d-none');
    errorLog.classList.remove('error-shake');

    // 4. Reset Input Stats
    const inputStats = document.getElementById('inputStats');
    if(inputStats) inputStats.classList.add('d-none');

    console.log("> SYSTEM_RESET_COMPLETE");
}

// Sync the filename input with the download attribute in real-time
document.addEventListener('input', function (e) {
    if (e.target && e.target.id === 'fileName') {
        const downloadLink = document.getElementById('downloadLink');
        const name = e.target.value.trim() || "RESIZED_IMG";
        downloadLink.download = `${name}.jpg`;
    }
});