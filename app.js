class FtpFileDownloader {
  constructor() {
    // Get references to the input element and download button
    this.fileNameInput = document.getElementById("fileNameInput");
    this.downloadButton = document.getElementById("downloadButton");

    // Add an event listener to the download button
    this.downloadButton.addEventListener("click", () => this.downloadFile());
  }

  async downloadFile() {
    try {
      // Get the file name from the input box
      const fileName = this.fileNameInput.value.trim();

      if (!fileName) {
        alert("Please enter a valid file name.");
        return;
      }

      // Request the server-side script to initiate the FTP download
      const response = await fetch(`download.php?fileName=${fileName}`);

      if (response.ok) {
        // File found, initiate download
        window.location.href = `download.php?fileName=${fileName}`;
      } else {
        alert(`File not found or access denied: ${fileName}`);
      }
    } catch (error) {
      console.error("Error downloading file:", error);
    }
  }
}

// Initialize the FtpFileDownloader class when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const downloader = new FtpFileDownloader();
});
