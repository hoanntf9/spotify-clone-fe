import { createShadowTempalate, createFileLoader } from "../../utils/common.js";
const { loadMultipleFiles, loadFile } = createFileLoader(import.meta.url);

class AppFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  async connectedCallback() {
    const [cssTexts, htmlText] = await Promise.all([
      loadMultipleFiles([
        "./../../css/layout.css",
        "./../../css/reset.css",
        "./../../css/responsive.css",
        "./../../css/variables.css",
        "./../../css/components.css",
      ]),
      loadFile("./app-footer.html")
    ]);

    this.shadowRoot.innerHTML = createShadowTempalate(cssTexts, htmlText);
  }
}

customElements.define("app-footer", AppFooter);