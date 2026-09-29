class DomainNameFilter {
  constructor(textAreaId, excludeDomains = []) {
    this.textArea = document.getElementById(textAreaId);
    this.totalDomains = document.getElementById("totalDomains");
    this.displayAsRow = false;
    this.outputTextArea = document.getElementById("filterDone");
    this.filteredDomainNames = [];
    this.excludeDomains = excludeDomains; // Use excludeDomains
  }

  // extractDomainNames(text) {
  //   const domainRegex =
  //     /(?:^|\s)([a-zA-Z0-9-]+(\.[a-zA-Z-]+)+)(?=\s|$)(?![0-9]+(\.[0-9]+)+$)/g;
  //   const extractedDomains = text.match(domainRegex) || [];
  //   const finalDomains = extractedDomains.map((domain) => domain.toLowerCase());
  //   console.log(finalDomains);
  //   return finalDomains;
  // }

  extractDomainNames(text) {
    const domainRegex =
      /(?:^|\s)([a-zA-Z0-9-]+(\.[a-zA-Z-]+)+)(?=\s|$)(?![0-9]+(\.[0-9]+)+$)/g;
    const extractedDomains = text.match(domainRegex) || [];
    console.log(extractedDomains);
    // Use Set to remove duplicates after converting to lowercase
    const uniqueDomains = new Set(
      extractedDomains.map((domain) => domain.toLowerCase())
    );
    console.log(Array.from(uniqueDomains));
    return Array.from(uniqueDomains);
  }

  filterDomainNames() {
    const lowerCaseText = this.textArea.value.toLowerCase();
    const textWithoutCommas = lowerCaseText.replace(/,/g, " ");
    const domainNames = this.extractDomainNames(textWithoutCommas);
    const uniqueDomainNames = new Set(domainNames);

    this.filteredDomainNames = Array.from(uniqueDomainNames).filter(
      (domain) => {
        const domainWithoutExtension = domain.replace(
          /^(https?:\/\/)?(www\.)?/,
          ""
        );
        return (
          domain !== "dan.com" &&
          !this.excludeDomains.includes(domainWithoutExtension) &&
          domainWithoutExtension.indexOf(".") !== -1 &&
          domainWithoutExtension.indexOf(".") !== 0
        );
      }
    );

    return this.filteredDomainNames;
  }

  displayFilteredDomainNames() {
    const totalDomains = this.filteredDomainNames.length;
    this.totalDomains.textContent = totalDomains;

    const filteredDomains = this.filteredDomainNames.map((domain) =>
      domain.trim()
    );

    if (this.displayAsRow) {
      this.outputTextArea.value = filteredDomains.join(", ");
    } else {
      this.outputTextArea.value = filteredDomains.join("\n");
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

  const excludeDomains = ["Dan.com"];

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
