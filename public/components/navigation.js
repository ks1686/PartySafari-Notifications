class NavigationBar extends HTMLElement {
    constructor() {
      super();
  
    }
  
    connectedCallback() {
      this.render();
    }
  
    render() {
        this.innerHTML = `
        <p class="logo">PartySafari</p>
        <div id="nav-bar-container" class="nav_bar_container">
            <ul>
                <li><a href="#">Home</a></li>
                <li><a href="#">Map</a></li>
                <li><a href="#">Contact</a></li>
            </ul>
      
        </div>
        `;
    }
  }
  
  customElements.define("nav-bar", NavigationBar);
  
  // NOTE: CUSTOM ELEMENTS NEED AT LEAST 1 HYPHEN