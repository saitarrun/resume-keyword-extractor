// Interactive Element Picker for targeting custom job postings or atypical DOM containers

class ElementPicker {
  constructor(onElementSelected) {
    this.onElementSelected = onElementSelected;
    this.isActive = false;
    this.hoveredElement = null;

    this.boundMouseOver = this.onMouseOver.bind(this);
    this.boundMouseOut = this.onMouseOut.bind(this);
    this.boundClick = this.onClick.bind(this);
    this.boundKeyDown = this.onKeyDown.bind(this);
  }

  start() {
    if (this.isActive) return;
    this.isActive = true;

    document.body.style.cursor = 'crosshair';
    this.showBanner();

    document.addEventListener('mouseover', this.boundMouseOver, true);
    document.addEventListener('mouseout', this.boundMouseOut, true);
    document.addEventListener('click', this.boundClick, true);
    document.addEventListener('keydown', this.boundKeyDown, true);
  }

  stop() {
    if (!this.isActive) return;
    this.isActive = false;

    document.body.style.cursor = 'default';
    this.removeBanner();

    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('jke-picker-hover');
      this.hoveredElement = null;
    }

    document.removeEventListener('mouseover', this.boundMouseOver, true);
    document.removeEventListener('mouseout', this.boundMouseOut, true);
    document.removeEventListener('click', this.boundClick, true);
    document.removeEventListener('keydown', this.boundKeyDown, true);
  }

  showBanner() {
    let banner = document.getElementById('jke-picker-banner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'jke-picker-banner';
      banner.innerHTML = `
        <span>🎯 <strong>Click on the job description area</strong> to target and scan it. (Press ESC to cancel)</span>
        <button id="jke-picker-cancel">Cancel</button>
      `;
      document.body.appendChild(banner);
      document.getElementById('jke-picker-cancel')?.addEventListener('click', () => this.stop());
    }
  }

  removeBanner() {
    document.getElementById('jke-picker-banner')?.remove();
  }

  onMouseOver(e) {
    if (!this.isActive) return;
    const target = e.target;
    if (target.closest('#jke-picker-banner') || target.closest('.jke-sidebar-container')) return;

    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('jke-picker-hover');
    }
    this.hoveredElement = target;
    this.hoveredElement.classList.add('jke-picker-hover');
  }

  onMouseOut(e) {
    if (!this.isActive) return;
    if (this.hoveredElement) {
      this.hoveredElement.classList.remove('jke-picker-hover');
      this.hoveredElement = null;
    }
  }

  onClick(e) {
    if (!this.isActive) return;
    const target = e.target;
    if (target.closest('#jke-picker-banner') || target.closest('.jke-sidebar-container')) return;

    e.preventDefault();
    e.stopPropagation();

    const selectedElement = target;
    this.stop();

    if (this.onElementSelected && selectedElement) {
      this.onElementSelected(selectedElement);
    }
  }

  onKeyDown(e) {
    if (e.key === 'Escape' && this.isActive) {
      this.stop();
    }
  }
}

if (typeof window !== 'undefined') {
  window.ElementPicker = ElementPicker;
}
