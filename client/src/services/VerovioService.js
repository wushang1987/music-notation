import createVerovioModule from 'verovio/wasm';
import { VerovioToolkit } from 'verovio/esm';

class VerovioService {
  constructor() {
    this.tk = null;
    this.loading = false;
    this.promise = null;
  }

  async init() {
    if (this.tk) return this.tk;
    if (this.loading) return this.promise;

    this.loading = true;
    this.promise = createVerovioModule().then((module) => {
      try {
        this.tk = new VerovioToolkit(module);
        this.loading = false;
        return this.tk;
      } catch (err) {
        this.loading = false;
        console.error("Failed to create VerovioToolkit", err);
        throw err;
      }
    }).catch(err => {
      this.loading = false;
      console.error("Verovio module initialization failed", err);
      throw err;
    });

    return this.promise;
  }

  getToolkit() {
    return this.tk;
  }

  // Identify element at coordinates (relative to SVG)
  getElementAt(x, y) {
    if (!this.tk) return null;
    return this.tk.getElementsAtTime(0, x, y); // This is one way, but usually we just use the SVG ID
  }

  // Execute an edit command
  edit(command) {
    if (!this.tk) return null;
    try {
      this.tk.edit(command);
      return this.tk.getMEI();
    } catch (err) {
      console.error("Verovio edit error:", err);
      return null;
    }
  }

  render(mei, options = {}) {

    if (!this.tk) return null;
    
    const defaultOptions = {
      pageHeight: 2970,
      pageWidth: 2100,
      scale: 30,
      adjustPageHeight: true,
      ...options
    };

    try {
      this.tk.setOptions(defaultOptions);
      this.tk.loadData(mei);
      const svg = this.tk.renderToSVG(1, {});
      return svg;
    } catch (err) {
      console.error("Verovio render error:", err);
      return null;
    }
  }
}

export default new VerovioService();
