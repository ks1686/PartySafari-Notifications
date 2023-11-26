class Footer extends HTMLElement {
    constructor() {
      super();
  
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
        this.innerHTML = `
        <div id="footer-container" class="footer_container">
            <hr>
            <p class="slogan">We bring the party to you!</p>
            <p class="logo">PartySafari</p>
        </div>
        `;
    }
  }
  
  customElements.define("site-footer", Footer);
  
  // NOTE: CUSTOM ELEMENTS NEED AT LEAST 1 HYPHEN