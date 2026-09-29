import { extractDomains } from "./extractDomains.js";

const input = document.getElementById("filter");
const output = document.getElementById("filterDone");
const total = document.getElementById("totalDomains");
const filterButton = document.getElementById("filterButton");
const copyButton = document.getElementById("copyButton");

const state = { domains: [], asRow: false };
let latestRequest = 0;

function render() {
  total.textContent = state.domains.length;
  output.value = state.domains.join(state.asRow ? ", " : "\n");
}

async function fetchDomains(text) {
  try {
    const response = await fetch("api/filter", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const { domains } = await response.json();
    if (!Array.isArray(domains)) throw new Error("Unexpected response");
    return domains;
  } catch {
    return extractDomains(text);
  }
}

async function filter() {
  const requestId = ++latestRequest;
  filterButton.disabled = true;
  try {
    const domains = await fetchDomains(input.value);
    // Ignore responses from earlier clicks that finished late.
    if (requestId !== latestRequest) return;
    state.domains = domains;
    render();
  } finally {
    if (requestId === latestRequest) filterButton.disabled = false;
  }
}

function sort(direction) {
  state.domains.sort((a, b) => direction * a.localeCompare(b));
  render();
}

async function copy() {
  try {
    await navigator.clipboard.writeText(output.value);
  } catch {
    output.select();
    document.execCommand("copy");
  }
  copyButton.textContent = "Copied!";
  setTimeout(() => (copyButton.textContent = "Copy"), 1500);
}

function clear() {
  latestRequest++;
  filterButton.disabled = false;
  input.value = "";
  state.domains = [];
  render();
  input.focus();
}

filterButton.addEventListener("click", filter);
copyButton.addEventListener("click", copy);
document.getElementById("toggleColOrRow").addEventListener("click", () => {
  state.asRow = !state.asRow;
  render();
});
document
  .getElementById("sortAscending")
  .addEventListener("click", () => sort(1));
document
  .getElementById("sortDescending")
  .addEventListener("click", () => sort(-1));
document.getElementById("clearButton").addEventListener("click", clear);

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    filter();
  }
});
