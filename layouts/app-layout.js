
class AppLayout extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.shadowRoot.innerHTML = `
      <div class="app-container">
        <slot name="sidebar-slot"></slot>

        <main>
          <slot name="content"></slot>
        </main>

       <slot name="footer-slot"></slot>
      </div>
    `;
  }
}

customElements.define("app-layout", AppLayout);