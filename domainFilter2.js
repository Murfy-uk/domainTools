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
    // const domainRegex =
    //   /(?:^|\s)([a-zA-Z0-9-]+(\.[a-zA-Z-]+)?)(?=\s|$)(?![0-9-]+\.[0-9-]+$)/g;

    const domainRegex =
      /(?:^|\s)([a-zA-Z0-9-]+(\.[a-zA-Z-]+)?)(?=\s|$)(?![0-9-]+\.[a-zA-Z-]+$)/g;

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
        domainWithoutExtension.indexOf(".") !== -1 &&
        domainWithoutExtension.indexOf(".") !== 0
      );
    });
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
