function createShadowTempalate(cssTexts, htmlText) {
  return `
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
      ${cssTexts.join("\n")}
    </style>
    ${htmlText}
  `;
}

function createFileLoader(baseUrl) {
  async function loadFile(path) {
    const url = new URL(path, baseUrl).href;
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Không thể tải file: ${path}`);
    return response.text();
  }

  async function loadMultipleFiles(paths) {
    return Promise.all(paths.map(loadFile));
  }

  return { loadFile, loadMultipleFiles };
}

function escapeHtml(str) {
  const map = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "/": "&#x2F;",
  };
  return String(str).replace(/[&<>"'\/]/g, (char) => map[char]);
}

function formatTrackPlayCount(number) {
  const formatter = new Intl.NumberFormat("en-US");
  return formatter.format(number);
}

function formartTrackDuration(totalSeconds) {
  const sec = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export {
  createShadowTempalate,
  createFileLoader,
  escapeHtml,
  formatTrackPlayCount,
  formartTrackDuration,
};
