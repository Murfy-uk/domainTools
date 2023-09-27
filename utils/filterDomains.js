class DomainNameFilter {
  constructor(textAreaId) {
    this.textArea = document.getElementById(textAreaId);
    this.totalDomains = document.getElementById("totalDomains");
    this.displayAsRow = false; // Track the display mode
    this.outputTextArea = document.getElementById("filterDone");
    this.filteredDomainNames = []; // Store filtered domain names
  }

  // Helper function to extract domain names from text
  extractDomainNames(text) {
    const domainRegex =
      /(?:(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(?:\.[a-zA-Z]{2})?)|@([a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}(?:\.[a-zA-Z]{2})?))/g;
    return text.match(domainRegex) || [];
  }

  // Filter domain names from text and return as an array
  filterDomainNames() {
    const text = this.textArea.value;
    const domainNames = this.extractDomainNames(text);
    this.filteredDomainNames = domainNames; // Store filtered domain names
    return domainNames;
  }

  // Display filtered domain names and total count
  displayFilteredDomainNames() {
    const totalDomains = this.filteredDomainNames.length;
    this.totalDomains.textContent = totalDomains;

    if (this.displayAsRow) {
      this.outputTextArea.value = this.filteredDomainNames.join(", ");
    } else {
      this.outputTextArea.value = this.filteredDomainNames.join("\n");
    }
  }

  // Toggle between row and column display
  toggleDisplay() {
    this.displayAsRow = !this.displayAsRow;
    this.displayFilteredDomainNames();
  }

  // Sort domain names in ascending order
  sortAscending() {
    this.filteredDomainNames.sort((a, b) => a.localeCompare(b));
    this.displayFilteredDomainNames();
  }

  // Sort domain names in descending order
  sortDescending() {
    this.filteredDomainNames.sort((a, b) => b.localeCompare(a));
    this.displayFilteredDomainNames();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleColOrRow");
  const sortAscendingButton = document.getElementById("sortAscending");
  const sortDescendingButton = document.getElementById("sortDescending");

  const domainFilter = new DomainNameFilter("filter");

  toggleButton.addEventListener("click", function () {
    domainFilter.toggleDisplay();
  });

  sortAscendingButton.addEventListener("click", function () {
    domainFilter.sortAscending();
  });

  sortDescendingButton.addEventListener("click", function () {
    domainFilter.sortDescending();
  });

  // Copy the content of filterDone to the clipboard
  function copyToClipboard() {
    const outputTextArea = domainFilter.outputTextArea;
    outputTextArea.select();
    document.execCommand("copy");
  }

  // Copy button functionality
  const copyButton = document.getElementById("copyButton");
  copyButton.addEventListener("click", function () {
    copyToClipboard();
  });

  // Clear inputs
  const clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", function () {
    domainFilter.textArea.value = "";
    domainFilter.outputTextArea.value = "";
    domainFilter.totalDomains.textContent = "0";
    domainFilter.filteredDomainNames = []; // Clear filtered domain names
  });

  // Filter button functionality
  const filterButton = document.getElementById("filterButton");
  filterButton.addEventListener("click", () => {
    domainFilter.filterDomainNames(); // Update filtered domain names
    domainFilter.displayFilteredDomainNames();
  });
});
