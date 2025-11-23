// board.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements AfterViewInit {

  @ViewChild('canvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D;

  // logical drawing area (keeps consistent sizes)
  canvasWidth = 960;
  canvasHeight = 720;

  backgroundColor = '#ffffff';

  // zoom / grid
  zoom = 1;
  minZoom = 0.4;
  maxZoom = 5;
  zoomStep = 0.1;

  gridSize = 20;
  gridless = true; // default

  // pan
  offsetX = 0; // container-local pixels
  offsetY = 0; // container-local pixels
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // DPR
  devicePixelRatio = window.devicePixelRatio || 1;

  // dropdown options
  zoomLevels = [
    { label: 'Fit', value: 'fit' },
    { label: '50%', value: '0.5' },
    { label: '100%', value: '1' },
    { label: '200%', value: '2' },
    { label: '300%', value: '3' },
    { label: '500%', value: '5' }
  ];

  ngAfterViewInit(): void {
    this.setupCanvas();
    this.resetPanToCenter();
    this.render();
  }

  setupCanvas() {
    const canvas = this.canvasRef.nativeElement;

    // CSS size should match logical size (board container defines this too)
    canvas.style.width = this.canvasWidth + 'px';
    canvas.style.height = this.canvasHeight + 'px';

    // actual drawing buffer scaled for DPR
    canvas.width = Math.round(this.canvasWidth * this.devicePixelRatio);
    canvas.height = Math.round(this.canvasHeight * this.devicePixelRatio);

    this.ctx = canvas.getContext('2d')!;
    // Keep the DPR scale so subsequent drawing uses CSS pixels coordinates.
    this.ctx.scale(this.devicePixelRatio, this.devicePixelRatio);
  }

  // -------------------------
  // Resize: keep centered on viewport changes
  // -------------------------
  @HostListener('window:resize')
  onWindowResize() {
    // re-center on resize
    this.resetPanToCenter();
    this.render();
  }

  // -------------------------
  // Mouse / Pan handlers
  // -------------------------
  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    const rect = this.canvasRef.nativeElement.getBoundingClientRect();
    if (e.clientX < rect.left || e.clientX > rect.right || e.clientY < rect.top || e.clientY > rect.bottom) return;

    // Middle button or Shift + left click to pan
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isPanning) return;
    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;

    this.offsetX += dx;
    this.offsetY += dy;

    this.clampPan();
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;

    this.render();
  }

  @HostListener('window:mouseup')
  onMouseUp() {
    this.isPanning = false;
  }

  // -------------------------
  // Wheel / Zoom handlers
  // -------------------------
  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent) {
    e.preventDefault();

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    const dir = e.deltaY > 0 ? -1 : 1;
    const rawNewZoom = this.zoom + dir * this.zoomStep;
    const newZoom = Math.max(this.minZoom, Math.min(rawNewZoom, this.maxZoom));

    // PROTECTION: STOP zooming out when scaled grid would be too small
    const scaledGridPx = this.gridSize * newZoom;
    if (scaledGridPx < 8) {
      // block further zoom-out (optional UI feedback)
      return;
    }

    this.smoothZoomTo(newZoom, mouseX, mouseY);
  }

  onZoomSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'fit') {
      this.fitToScreen();
      return;
    }
    const z = parseFloat(value);
    const newZoom = Math.max(this.minZoom, Math.min(z, this.maxZoom));

    // protect grid visibility
    if (this.gridSize * newZoom < 8) return;

    this.smoothZoomTo(newZoom);
  }

  fitToScreen() {
    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const rect = container.getBoundingClientRect();
    const innerW = rect.width;
    const innerH = rect.height;

    const newZoom = Math.max(this.minZoom, Math.min(Math.min(innerW / this.canvasWidth, innerH / this.canvasHeight), this.maxZoom));

    if (this.gridSize * newZoom < 8) {
      const safeZoom = 8 / this.gridSize;
      this.smoothZoomTo(Math.max(newZoom, safeZoom));
      return;
    }

    this.smoothZoomTo(newZoom);
  }

  // -------------------------
  // Smooth zoom animation
  // -------------------------
  smoothZoomTo(targetZoom: number, pivotX?: number, pivotY?: number) {
    targetZoom = Math.max(this.minZoom, Math.min(targetZoom, this.maxZoom));

    if (this.gridSize * targetZoom < 8) {
      targetZoom = 8 / this.gridSize;
      targetZoom = Math.max(targetZoom, this.minZoom);
    }

    const start = this.zoom;
    const diff = targetZoom - start;
    const steps = 12;
    let step = 0;

    const animate = () => {
      step++;
      const t = step / steps;
      const eased = t * t * (3 - 2 * t); // smoothstep
      const z = start + diff * eased;
      this.setZoom(z, pivotX, pivotY);

      if (step < steps) requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  }

  // -------------------------
  // Core pivot zoom math + clamp
  // -------------------------
  setZoom(newZoom: number, pivotX?: number, pivotY?: number) {
    newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

    if (this.gridSize * newZoom < 8) {
      newZoom = Math.max(newZoom, 8 / this.gridSize);
    }

    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const rect = container.getBoundingClientRect();

    // Convert pivot (client coords) to container-local coords
    let pivotLocalX: number;
    let pivotLocalY: number;

    if (pivotX === undefined || pivotY === undefined) {
      pivotLocalX = rect.width / 2;
      pivotLocalY = rect.height / 2;
    } else {
      pivotLocalX = pivotX - rect.left;
      pivotLocalY = pivotY - rect.top;
    }

    const ratio = newZoom / this.zoom;

    // keep pivot stable (all in container-local coordinates)
    this.offsetX = pivotLocalX - (pivotLocalX - this.offsetX) * ratio;
    this.offsetY = pivotLocalY - (pivotLocalY - this.offsetY) * ratio;

    this.zoom = newZoom;

    this.clampPan();
    this.render();
  }

  // -------------------------
  // Pan clamping (keeps canvas visible inside board-container)
  // -------------------------
  clampPan() {
    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const containerRect = container.getBoundingClientRect();

    const containerW = containerRect.width;
    const containerH = containerRect.height;

    const scaledW = this.canvasWidth * this.zoom;
    const scaledH = this.canvasHeight * this.zoom;

    const minX = containerW - scaledW;
    const maxX = 0;

    const minY = containerH - scaledH;
    const maxY = 0;

    if (scaledW <= containerW) {
      this.offsetX = (containerW - scaledW) / 2;
    } else {
      this.offsetX = Math.min(maxX, Math.max(this.offsetX, minX));
    }

    if (scaledH <= containerH) {
      this.offsetY = (containerH - scaledH) / 2;
    } else {
      this.offsetY = Math.min(maxY, Math.max(this.offsetY, minY));
    }
  }

  // center the board initially (and after size changes)
  resetPanToCenter() {
    const container = this.canvasRef.nativeElement.parentElement as HTMLElement;
    const rect = container.getBoundingClientRect();

    const containerW = rect.width;
    const containerH = rect.height;

    const scaledW = this.canvasWidth * this.zoom;
    const scaledH = this.canvasHeight * this.zoom;

    this.offsetX = (containerW - scaledW) / 2;
    this.offsetY = (containerH - scaledH) / 2;
  }

  // -------------------------
  // Grid drawing (inside canvas)
  // -------------------------
  drawGrid(ctx: CanvasRenderingContext2D) {
    if (this.gridless) return;

    const scaledGrid = this.gridSize * this.zoom;

    if (scaledGrid < 8) return;

    ctx.beginPath();
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1 / this.zoom;

    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      ctx.moveTo(x, 0);
      ctx.lineTo(x, this.canvasHeight);
    }

    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      ctx.moveTo(0, y);
      ctx.lineTo(this.canvasWidth, y);
    }

    ctx.stroke();
  }

  toggleGrid() {
    this.gridless = !this.gridless;
    this.render();
  }

  // -------------------------
  // Coordinate helpers
  // -------------------------
  toCanvasX(screenX: number) {
    const rect = this.canvasRef.nativeElement.parentElement!.getBoundingClientRect();
    const local = screenX - rect.left;
    return (local - this.offsetX) / this.zoom;
  }
  toCanvasY(screenY: number) {
    const rect = this.canvasRef.nativeElement.parentElement!.getBoundingClientRect();
    const local = screenY - rect.top;
    return (local - this.offsetY) / this.zoom;
  }

  // -------------------------
  // Main render
  // -------------------------
  render() {
    if (!this.ctx) return;
    const ctx = this.ctx;
    const canvasEl = this.canvasRef.nativeElement;

    // Reset transform & clear the entire backing buffer (device pixels)
    ctx.save();
    ctx.setTransform(1, 0, 0, 1, 0, 0);

    // IMPORTANT: use canvasEl.width/height (device-pixel sizes) to clear full buffer
    ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
    ctx.restore();

    // Apply pan + zoom (offsets are container-local CSS pixels)
    ctx.save();
    ctx.translate(this.offsetX, this.offsetY);
    ctx.scale(this.zoom, this.zoom);

    // Background (in CSS pixels)
    ctx.fillStyle = this.backgroundColor;
    ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight);

    // Grid
    this.drawGrid(ctx);

    // future: shapes, selection, etc.

    ctx.restore();
  }
}
