class DomainNameFilter {
  constructor(textAreaId, exclude = []) {
    this.textArea = document.getElementById(textAreaId);
    this.totalDomains = document.getElementById("totalDomains");
    this.displayAsRow = false;
    this.outputTextArea = document.getElementById("filterDone");
    this.filteredDomainNames = [];
    this.exclude = exclude; // Add domains to be excluded here
  }

  extractDomainNames(text) {
    const domainRegex =
      /(?:(?:https?:\/\/)?(?:www\.)?([a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)+\.[a-zA-Z]{2,6}))/g;

    return text.match(domainRegex) || [];
  }

  filterDomainNames() {
    const text = this.textArea.value;
    const domainNames = this.extractDomainNames(text);
    this.filteredDomainNames = domainNames.filter((domain) => {
      const domainWithoutExtension = domain.replace(
        /^(https?:\/\/)?(www\.)?/,
        ""
      );
      return (
        !this.exclude.includes(domainWithoutExtension) &&
        domainWithoutExtension.indexOf(".") !== -1
      );
    });
    return this.filteredDomainNames;
  }

  displayFilteredDomainNames() {
    const totalDomains = this.filteredDomainNames.length;
    this.totalDomains.textContent = totalDomains;

    if (this.displayAsRow) {
      this.outputTextArea.value = this.filteredDomainNames.join(", ");
    } else {
      this.outputTextArea.value = this.filteredDomainNames.join("\n");
    }
  }

  toggleDisplay() {
    this.displayAsRow = !this.displayAsRow;
    this.displayFilteredDomainNames();
  }

  sortAscending() {
    this.filteredDomainNames.sort((a, b) => a.localeCompare(b));
    this.displayFilteredDomainNames();
  }

  sortDescending() {
    this.filteredDomainNames.sort((a, b) => b.localeCompare(a));
    this.displayFilteredDomainNames();
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const toggleButton = document.getElementById("toggleColOrRow");
  const sortAscendingButton = document.getElementById("sortAscending");
  const sortDescendingButton = document.getElementById("sortDescending");

  const excludeDomains = ["dan.com"]; // Add domains to be excluded here
  const domainFilter = new DomainNameFilter("filter", excludeDomains);

  toggleButton.addEventListener("click", function () {
    domainFilter.toggleDisplay();
  });

  sortAscendingButton.addEventListener("click", function () {
    domainFilter.sortAscending();
  });

  sortDescendingButton.addEventListener("click", function () {
    domainFilter.sortDescending();
  });

  function copyToClipboard() {
    const outputTextArea = domainFilter.outputTextArea;
    outputTextArea.select();
    document.execCommand("copy");
  }

  const copyButton = document.getElementById("copyButton");
  copyButton.addEventListener("click", function () {
    copyToClipboard();
  });

  const clearButton = document.getElementById("clearButton");
  clearButton.addEventListener("click", function () {
    domainFilter.textArea.value = "";
    domainFilter.outputTextArea.value = "";
    domainFilter.totalDomains.textContent = "0";
    domainFilter.filteredDomainNames = [];
  });

  const filterButton = document.getElementById("filterButton");
  filterButton.addEventListener("click", () => {
    domainFilter.filterDomainNames();
    domainFilter.displayFilteredDomainNames();
  });
});
