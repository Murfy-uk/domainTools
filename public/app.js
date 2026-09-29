import { extractDomains } from "./extractDomains.js";

const input = document.getElementById("filter");
const output = document.getElementById("filterDone");
const total = document.getElementById("totalDomains");
const filterButton = document.getElementById("filterButton");
const copyLabel = document.getElementById("copyLabel");
const formatLines = document.getElementById("formatLines");
const formatCommas = document.getElementById("formatCommas");

const state = { domains: [], asRow: false };
let latestRequest = 0;

function asText() {
  return state.domains.join(state.asRow ? ", " : "\n");
}

function render() {
  total.textContent = state.domains.length;
  formatLines.setAttribute("aria-pressed", String(!state.asRow));
  formatCommas.setAttribute("aria-pressed", String(state.asRow));

  if (state.domains.length === 0) {
    const empty = document.createElement("p");
    empty.className = "empty";
    empty.textContent = "Domains from your text will appear here.";
    output.replaceChildren(empty);
  } else if (state.asRow) {
    const line = document.createElement("p");
    line.className = "commas";
    line.textContent = asText();
    output.replaceChildren(line);
  } else {
    const list = document.createElement("ol");
    for (const domain of state.domains) {
      const item = document.createElement("li");
      item.textContent = domain;
      list.append(item);
    }
    output.replaceChildren(list);
  }
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

function setFormat(asRow) {
  state.asRow = asRow;
  render();
}

async function copy() {
  const text = asText();
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    // Clipboard API needs a secure context; fall back to a hidden textarea.
    const scratch = document.createElement("textarea");
    scratch.value = text;
    scratch.style.position = "fixed";
    scratch.style.opacity = "0";
    document.body.append(scratch);
    scratch.select();
    document.execCommand("copy");
    scratch.remove();
  }
  copyLabel.textContent = "Copied!";
  setTimeout(() => (copyLabel.textContent = "Copy all"), 1500);
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
document.getElementById("copyButton").addEventListener("click", copy);
formatLines.addEventListener("click", () => setFormat(false));
formatCommas.addEventListener("click", () => setFormat(true));
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
