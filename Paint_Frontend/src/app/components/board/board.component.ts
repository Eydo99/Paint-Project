// board.component.ts
import { Component, ElementRef, ViewChild, AfterViewInit, OnDestroy, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import Konva from 'konva';
import { Subscription } from 'rxjs';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements AfterViewInit, OnDestroy {

  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

  // Konva variables
  stage!: Konva.Stage;
  //layer للاشكال
  mainLayer!: Konva.Layer;
  //layer للجريد
  gridLayer!: Konva.Layer;
  // هو الصندوق اللي بيظهر حوالين الشكل لما تختاره
  transformer!: Konva.Transformer;



  private subscriptions: Subscription = new Subscription();
  private readonly BACKEND_URL = 'http://localhost:8080/api/canvas';

  // logical drawing area
  canvasWidth = 960;
  canvasHeight = 720;
  backgroundColor = '#ffffff';

  // ✨ NEW: Active tool from toolbar (الأداة النشطة من الـ Toolbar)
  activeTool: string = 'select';

  // ✨ NEW: Drawing state (حالة الرسم)
  isDrawing = false;                    // هل المستخدم بيرسم دلوقتي؟
  currentShape: Konva.Shape | null = null;  // الشكل اللي بيترسم حالياً
  startX = 0;                           // نقطة البداية X
  startY = 0;                           // نقطة البداية Y

  // zoom / grid
  zoom = 1;
  minZoom = 0.4;
  maxZoom = 5;
  zoomStep = 0.1; // Slower zoom speed (was 0.5)
  gridSize = 20;
  gridless = true;

  // pan
  offsetX = 0;
  offsetY = 0;
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

  // dropdown options
  zoomLevels = [
    { label: 'Fit', value: 'fit' },
    { label: '50%', value: '0.5' },
    { label: '100%', value: '1' },
    { label: '200%', value: '2' },
    { label: '300%', value: '3' },
    { label: '500%', value: '5' }
  ];

  constructor(
    private canvasService: CanvasService,
    private http: HttpClient
  ) {}

  ngAfterViewInit(): void {
    // استخدام setTimeout للتأكد من أن DOM جاهز تماماً
    setTimeout(() => {
      this.initKonva();
      this.resetPanToCenter();
      this.drawGrid();
      this.setupSubscriptions();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.stage) {
      this.stage.destroy();
    }
  }

  // -------------------------
  // Konva Initialization
  // -------------------------
  initKonva() {
    const container = this.getContainer();
    if (!container) {
      console.error('Container not found!');
      return;
    }
    //امسك ال canavsHTML واعمل منهKonva.Stage
    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight,
      x: 0,
      y: 0
    });

    // 1. Grid Layer (Background)
    this.gridLayer = new Konva.Layer();
    this.stage.add(this.gridLayer);

    // 2. Main Layer (Shapes)
    this.mainLayer = new Konva.Layer();
    this.stage.add(this.mainLayer);

    // 3. Transformer
    this.transformer = new Konva.Transformer();
    this.mainLayer.add(this.transformer);
   //إنشاء Background
    const bg = new Konva.Rect({
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: this.backgroundColor,
      listening: true,
      id: 'board-background'
    });
    this.gridLayer.add(bg);
    bg.moveToBottom();

    this.initKonvaEvents();
  }

  // Helper method للحصول على Container بأمان
  private getContainer(): HTMLDivElement | null {
    if (!this.canvasRef?.nativeElement?.parentElement) {
      return null;
    }
    return this.canvasRef.nativeElement.parentElement as HTMLDivElement;
  }

  private initKonvaEvents() {
    //لو ضغط علي الباكجراوند او الستيدج بيلغي الاختيار
    //غير كدا بيسيلكت الشكل
    this.stage.on('click tap', (e) => {

      if (e.target === this.stage || e.target.id() === 'board-background') {
        this.transformer.nodes([]);
        return;
      }
      if (e.target.getParent()?.className !== 'Transformer') {
        this.transformer.nodes([e.target]);
      }

      // لو مش في select mode، ما تعملش selection
      if (this.activeTool !== 'select' && this.activeTool !== 'move') {
        return;
      }

    });


    // ✨ NEW: Mouse down - بداية الرسم
    this.stage.on('mousedown touchstart', (e) => {
      // لو بنعمل pan أو في select mode، ما ترسمش
      if (this.isPanning || this.activeTool === 'select' || this.activeTool === 'move') {
        return;
      }

      // جيب موضع الماوس على الـ stage
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      // حول من إحداثيات الشاشة لإحداثيات الـ canvas الفعلي
      const canvasPos = this.getCanvasPosition(pos.x, pos.y);

      this.isDrawing = true;
      this.startX = canvasPos.x;
      this.startY = canvasPos.y;

      // أنشئ الشكل بناءً على الأداة النشطة
      this.currentShape = this.createShape(this.activeTool, canvasPos.x, canvasPos.y);

      if (this.currentShape) {
        this.mainLayer.add(this.currentShape);
      }
    });

    // ✨ NEW: Mouse move - تحديث الشكل أثناء الرسم
    this.stage.on('mousemove touchmove', (e) => {
      if (!this.isDrawing || !this.currentShape) return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const canvasPos = this.getCanvasPosition(pos.x, pos.y);

      // حدث الشكل بناءً على موضع الماوس
      this.updateShape(this.currentShape, this.startX, this.startY, canvasPos.x, canvasPos.y);
    });

    // ✨ NEW: Mouse up - نهاية الرسم
    this.stage.on('mouseup touchend', (e) => {
      if (!this.isDrawing || !this.currentShape) return;

      this.isDrawing = false;

      // ابعت بيانات الشكل للـ backend
      this.sendShapeToBackend(this.currentShape);

      // اختار الشكل الجديد
      this.transformer.nodes([this.currentShape]);

      this.currentShape = null;
    });

    // لما يتسحب أو يتحول الشكل، احفظ التغييرات
    this.stage.on('dragend transformend', () => {
      this.saveStateToBackend('modify');
    });
  }
  // ✨ NEW: Convert stage position to canvas position (تحويل موضع الشاشة لموضع الـ canvas)
  // السبب: الماوس بيدينا إحداثيات على الشاشة، لكن احنا محتاجين إحداثيات على الـ canvas المنطقي
  // لازم نحسب الـ pan (موضع الـ stage) والـ zoom (التكبير)
  private getCanvasPosition(stageX: number, stageY: number): {x: number, y: number} {
    const stagePos = this.stage.position();  // موضع الـ stage الحالي
    const scale = this.stage.scaleX();       // مستوى التكبير

    // المعادلة: (إحداثيات الشاشة - موضع الـ stage) / التكبير
    return {
      x: (stageX - stagePos.x) / scale,
      y: (stageY - stagePos.y) / scale
    };
  }

  // ✨ NEW: Create shape based on tool type (إنشاء الشكل بناءً على نوع الأداة)
  private createShape(tool: string, x: number, y: number): Konva.Shape | null {
    // الإعدادات الافتراضية لكل الأشكال
    const defaultConfig = {
      x: x,
      y: y,
      fill: '#ffffff',      // لون التعبئة (ابيض)
      stroke: '#090101',    // لون الحدود (أسود)
      strokeWidth: 2,
      draggable: true       // يمكن سحب الشكل
    };

    switch(tool) {
      case 'rect':
        // مستطيل: عرض وارتفاع حر
        return new Konva.Rect({
          ...defaultConfig,
          width: 0,      // نبدأ بعرض 0
          height: 0      // نبدأ بارتفاع 0
        });

      case 'square':
        // مربع: العرض = الارتفاع
        return new Konva.Rect({
          ...defaultConfig,
          width: 0,
          height: 0
        });

      case 'circle':
        // دائرة: نصف قطر واحد
        return new Konva.Circle({
          ...defaultConfig,
          radius: 0
        });

      case 'ellipse':
        // قطع ناقص: نصفي قطر مختلفين
        return new Konva.Ellipse({
          ...defaultConfig,
          radiusX: 0,
          radiusY: 0
        });

      case 'triangle':
        // مثلث: polygon بـ 3 أضلاع
        return new Konva.RegularPolygon({
          ...defaultConfig,
          sides: 3,
          radius: 0
        });

      case 'line':
        // خط: نقطتين
        return new Konva.Line({
          ...defaultConfig,
          points: [x, y, x, y],  // من (x,y) إلى (x,y) - نقطة واحدة في البداية
          fill: undefined,        // الخط ما عندوش تعبئة
          strokeWidth: 3
        });

      default:
        return null;
    }
  }

  // ✨ NEW: Update shape while drawing (تحديث الشكل أثناء الرسم)
  private updateShape(shape: Konva.Shape, startX: number, startY: number, endX: number, endY: number): void {
    const width = endX - startX;    // العرض
    const height = endY - startY;   // الارتفاع

    if (shape instanceof Konva.Rect) {
      // للمستطيلات والمربعات
      if (this.activeTool === 'square') {
        // مربع: خلي العرض = الارتفاع (أصغر قيمة)
        const size = Math.min(Math.abs(width), Math.abs(height));
        shape.width(width >= 0 ? size : -size);
        shape.height(height >= 0 ? size : -size);
      } else {
        // مستطيل: عرض وارتفاع حر
        shape.width(Math.abs(width));
        shape.height(Math.abs(height));
        // اضبط الموضع لو المستخدم رسم للخلف أو لفوق
        shape.x(width >= 0 ? startX : endX);
        shape.y(height >= 0 ? startY : endY);
      }
    }
    else if (shape instanceof Konva.Circle) {
      // دائرة: نصف القطر = المسافة بين النقطتين / 2
      // استخدام Pythagorean theorem: distance = √(width² + height²)
      const radius = Math.sqrt(width * width + height * height) / 2;
      shape.radius(radius);
    }
    else if (shape instanceof Konva.Ellipse) {
      // قطع ناقص: نصفي قطر مختلفين
      shape.radiusX(Math.abs(width) / 2);
      shape.radiusY(Math.abs(height) / 2);
      // حط المركز في نص المسافة
      shape.x(startX + width / 2);
      shape.y(startY + height / 2);
    }
    else if (shape instanceof Konva.RegularPolygon) {
      // مثلث: نصف القطر = المسافة / 2
      const radius = Math.sqrt(width * width + height * height) / 2;
      shape.radius(radius);
      // حط المركز في نص المسافة
      shape.x(startX + width / 2);
      shape.y(startY + height / 2);
    }
    else if (shape instanceof Konva.Line) {
      // خط: حدث النقطتين
      shape.points([startX, startY, endX, endY]);
    }

    // ارسم كل الـ layer مرة واحدة (أسرع من رسم كل شكل لوحده)
    this.mainLayer.batchDraw();
  }

  // ✨ NEW: Send shape data to backend (إرسال بيانات الشكل للـ backend)
  private sendShapeToBackend(shape: Konva.Shape): void {
    // جهز البيانات اللي هتتبعت
    const shapeData = {
      type: shape.getClassName(),        // نوع الشكل: 'Rect', 'Circle', etc.
      properties: shape.getAttrs()           // كل الخصائص: {x, y, width, height, fill, ...}// وقت الإنشاء
    };

    console.log('Sending shape to backend:', shapeData);

    // ابعت للـ backend
    this.http.post(`${this.BACKEND_URL}/shape`, shapeData).subscribe({
      next: (response) => {
        console.log('Shape saved successfully:', response);
        // لو الـ backend رجع ID، احفظه في الشكل
        if (response && (response as any).id) {
          shape.setAttr('Id', (response as any).id);
        }
      },
      error: (err) => {
        console.error('Failed to save shape:', err);
      }
    });
  }

  // ✨ NEW: Method to receive tool change from toolbar (استقبال تغيير الأداة من الـ toolbar)
  onToolChange(tool: string): void {
    this.activeTool = tool;

    // لو رجعنا لـ select mode، الغي الاختيار
    if (tool === 'select') {
      this.transformer.nodes([]);
    }

    // لو الأداة هي action (copy, delete, etc.)، نفذها فوراً
    if (['copy', 'delete', 'clear', 'undo', 'redo'].includes(tool)) {
      this.handleAction(tool);
    }

    console.log('Active tool changed to:', tool);
  }
  // -------------------------
  // Resize: keep centered on viewport changes
  // -------------------------
  @HostListener('window:resize')
  onWindowResize() {
    const container = this.getContainer();
    if (!container || !this.stage) return;

    this.stage.width(container.clientWidth);
    this.stage.height(container.clientHeight);
    this.resetPanToCenter();
    this.drawGrid();
  }

  // -------------------------
  // Mouse / Pan handlers
  // -------------------------
  @HostListener('mousedown', ['$event'])
  onMouseDown(e: MouseEvent) {
    if (e.button === 1 || (e.button === 0 && e.shiftKey)) {
      this.isPanning = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
      e.preventDefault();
    }
  }

  @HostListener('mousemove', ['$event'])
  onMouseMove(e: MouseEvent) {
    if (!this.isPanning || !this.stage) return;
    e.preventDefault();

    const dx = e.clientX - this.lastMouseX;
    const dy = e.clientY - this.lastMouseY;

    const newPos = {
      x: this.stage.x() + dx,
      y: this.stage.y() + dy
    };

    this.stage.position(newPos);
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.clampPan();
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
    if (!this.stage) return;
    e.preventDefault();
    e.stopPropagation();

    const dir = e.deltaY > 0 ? -1 : 1;
    const rawNewZoom = this.zoom + dir * this.zoomStep;
    const newZoom = Math.max(this.minZoom, Math.min(rawNewZoom, this.maxZoom));

    // PROTECTION: STOP zooming out when scaled grid would be too small
    const scaledGridPx = this.gridSize * newZoom;
    if (scaledGridPx < 8) {
      return;
    }

    // Get mouse position relative to the stage
    const pointer = this.stage.getPointerPosition();
    if (!pointer) {
      // Fallback: zoom to center
      this.smoothZoomTo(newZoom);
      return;
    }

    // Use stage pointer position directly (already in stage coordinate system)
    this.setZoomKonvaInstant(newZoom, pointer.x, pointer.y);
  }

  // Instant zoom without animation for wheel
  setZoomKonvaInstant(newZoom: number, pointerX: number, pointerY: number) {
    if (!this.stage) return;

    const oldZoom = this.stage.scaleX();
    const oldPos = this.stage.position();

    // Calculate the point in canvas coordinates that the pointer is pointing to
    const mousePointTo = {
      x: (pointerX - oldPos.x) / oldZoom,
      y: (pointerY - oldPos.y) / oldZoom,
    };

    // Calculate new position to keep the pointer point stable
    const newPos = {
      x: pointerX - mousePointTo.x * newZoom,
      y: pointerY - mousePointTo.y * newZoom,
    };

    this.stage.scale({ x: newZoom, y: newZoom });
    this.stage.position(newPos);

    this.zoom = newZoom;
    this.clampPan();
    this.drawGrid();
  }

  onZoomSelect(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    if (value === 'fit') {
      this.fitToScreen();
      return;
    }
    const newZoom = parseFloat(value);
    const z = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

    if (this.gridSize * z < 8) return;

    const containerW = this.stage.width();
    const containerH = this.stage.height();
    const targetX = (containerW - this.canvasWidth * z) / 2;
    const targetY = (containerH - this.canvasHeight * z) / 2;

    this.animateToView(z, targetX, targetY);
  }

  fitToScreen() {
    if (!this.stage) return;

    const containerW = this.stage.width();
    const containerH = this.stage.height();
    let newZoom = Math.min(containerW / this.canvasWidth, containerH / this.canvasHeight);

    newZoom = newZoom * 0.9;
    newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));

    if (this.gridSize * newZoom < 8) {
      newZoom = Math.max(newZoom, 8 / this.gridSize);
    }

    const targetX = (containerW - this.canvasWidth * newZoom) / 2;
    const targetY = (containerH - this.canvasHeight * newZoom) / 2;

    this.animateToView(newZoom, targetX, targetY);
  }

  // -------------------------
  // Utility: Center the stage (called when zoom changes without a pivot)
  // -------------------------
  centerStage(newZoom: number) {
    if (!this.stage) return;

    const containerW = this.stage.width();
    const containerH = this.stage.height();

    // Calculate the position to center the scaled canvas
    const targetX = (containerW - this.canvasWidth * newZoom) / 2;
    const targetY = (containerH - this.canvasHeight * newZoom) / 2;

    this.stage.position({ x: targetX, y: targetY });
  }

  // -------------------------
  // Smooth zoom animation (used by fit and dropdown fixed zoom)
  // -------------------------
  animateToView(targetZoom: number, targetX: number, targetY: number) {
    if (!this.stage) return;

    const startZoom = this.zoom;
    const startX = this.stage.x();
    const startY = this.stage.y();

    const diffZoom = targetZoom - startZoom;
    const diffX = targetX - startX;
    const diffY = targetY - startY;

    const steps = 20;
    let step = 0;

    const animate = () => {
      step++;
      const t = step / steps;
      const eased = t * t * (3 - 2 * t); // smoothstep easing

      const currentZoom = startZoom + diffZoom * eased;
      const currentX = startX + diffX * eased;
      const currentY = startY + diffY * eased;

      this.stage.scale({ x: currentZoom, y: currentZoom });
      this.stage.position({ x: currentX, y: currentY });

      this.zoom = currentZoom;
      this.drawGrid();

      if (step < steps) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }

  // -------------------------
  // Smooth zoom animation (used by wheel interaction, pivots around cursor)
  // -------------------------
  smoothZoomTo(targetZoom: number, clientX?: number | null, clientY?: number | null) {
    if (!this.stage) return;

    targetZoom = Math.max(this.minZoom, Math.min(targetZoom, this.maxZoom));

    // Guard against making the grid too small
    if (this.gridSize * targetZoom < 8) {
      targetZoom = 8 / this.gridSize;
      targetZoom = Math.max(targetZoom, this.minZoom);
    }

    const startZoom = this.zoom;
    const diff = targetZoom - startZoom;

    const container = this.getContainer();
    if (!container) return;

    // Determine pivot point for zoom
    let cx: number;
    let cy: number;

    if (clientX === null || clientY === null || clientX === undefined || clientY === undefined) {
      // If no pivot provided (like from fallback), use center of container
      cx = container.clientWidth / 2;
      cy = container.clientHeight / 2;
    } else {
      // Use provided pivot point (like from wheel event)
      cx = clientX;
      cy = clientY;
    }

    const steps = 12;
    let step = 0;

    const animate = () => {
      step++;
      const t = step / steps;
      const eased = t * t * (3 - 2 * t); // smoothstep easing
      const z = startZoom + diff * eased;

      // Perform the Konva scale and pan operation
      this.setZoomKonva(z, cx, cy);

      if (step < steps) {
        requestAnimationFrame(animate);
      } else if (clientX === null || clientY === null || clientX === undefined || clientY === undefined) {
        // Final adjustment: ensure perfectly centered if no pivot was used (fallback)
        this.centerStage(targetZoom);
        this.drawGrid();
      }
    };

    requestAnimationFrame(animate);
  }

  // -------------------------
  // Core pivot zoom math + clamp
  // -------------------------
  setZoomKonva(newZoom: number, pivotX: number, pivotY: number) {
    if (!this.stage) return;

    const oldZoom = this.stage.scaleX();
    const oldPos = this.stage.position();

    // Calculate the point in canvas coordinates that the mouse is pointing to
    const mousePointTo = {
      x: (pivotX - oldPos.x) / oldZoom,
      y: (pivotY - oldPos.y) / oldZoom,
    };

    // Calculate new position to keep the mouse point stable
    const newPos = {
      x: pivotX - mousePointTo.x * newZoom,
      y: pivotY - mousePointTo.y * newZoom,
    };

    this.stage.scale({ x: newZoom, y: newZoom });
    this.stage.position(newPos);

    this.zoom = newZoom;
    this.clampPan();
    this.drawGrid();
  }

  // -------------------------
  // Pan clamping (keeps canvas visible inside board-container)
  // -------------------------
  clampPan() {
    const container = this.getContainer();
    if (!container || !this.stage) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const scaledW = this.canvasWidth * this.zoom;
    const scaledH = this.canvasHeight * this.zoom;

    let x = this.stage.x();
    let y = this.stage.y();

    // Logic: Don't let the board fly completely off screen
    if (scaledW <= containerW) {
      // If canvas is smaller than container, center it
      x = (containerW - scaledW) / 2;
    } else {
      // If canvas is larger, clamp to edges
      if (x > 0) x = 0;
      if (x < containerW - scaledW) x = containerW - scaledW;
    }

    if (scaledH <= containerH) {
      // If canvas is smaller than container, center it
      y = (containerH - scaledH) / 2;
    } else {
      // If canvas is larger, clamp to edges
      if (y > 0) y = 0;
      if (y < containerH - scaledH) y = containerH - scaledH;
    }

    this.stage.position({ x, y });
  }

  // Center the board initially (and after size changes)
  resetPanToCenter() {
    const container = this.getContainer();
    if (!container || !this.stage) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const scaledW = this.canvasWidth * this.zoom;
    const scaledH = this.canvasHeight * this.zoom;

    this.stage.position({
      x: (containerW - scaledW) / 2,
      y: (containerH - scaledH) / 2
    });
    this.stage.scale({ x: this.zoom, y: this.zoom });
  }

  // -------------------------
  // Grid drawing (Using Konva Lines)
  // -------------------------
  drawGrid() {
    if (!this.gridLayer) return;

    this.gridLayer.destroyChildren();

    const bg = new Konva.Rect({
      width: this.canvasWidth,
      height: this.canvasHeight,
      fill: this.backgroundColor,
      listening: true,
      id: 'board-background'
    });
    this.gridLayer.add(bg);

    if (this.gridless) return;

    const scaledGrid = this.gridSize * this.zoom;
    if (scaledGrid < 8) return;

    const strokeWidth = 1 / this.zoom;

    // Draw vertical lines
    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [x, 0, x, this.canvasHeight],
        stroke: '#e0e0e0',
        strokeWidth: strokeWidth,
        listening: false
      }));
    }

    // Draw horizontal lines
    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [0, y, this.canvasWidth, y],
        stroke: '#e0e0e0',
        strokeWidth: strokeWidth,
        listening: false
      }));
    }
  }

  toggleGrid() {
    this.gridless = !this.gridless;
    this.drawGrid();
  }

  // -------------------------
  // Backend Logic
  // -------------------------
  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.canvasService.action$.subscribe(action => this.handleAction(action))
    );
    this.subscriptions.add(
      this.canvasService.color$.subscribe(color => this.changeColor(color))
    );
    this.subscriptions.add(
      this.canvasService.save$.subscribe(data => this.exportFile(data.type, data.fileName))
    );
    this.subscriptions.add(
      this.canvasService.load$.subscribe(file => this.uploadFile(file))
    );



    this.subscriptions.add(
      this.canvasService.tool$.subscribe(tool => this.onToolChange(tool))
    );
  }

  private handleAction(action: string): void {
    if (!this.stage) return;
    const selectedNodes = this.transformer.nodes();
    const activeObject = selectedNodes.length > 0 ? selectedNodes[0] : null;

    switch (action) {
      case 'copy':
        if (activeObject) {
          const shapeData = activeObject.toObject();
          this.http.post(`${this.BACKEND_URL}/copy`, shapeData).subscribe({
            next: (copiedShapeData: any) => {
              const newShape = Konva.Node.create(copiedShapeData);
              this.mainLayer.add(newShape);
              this.transformer.nodes([newShape]);
              this.saveStateToBackend('copy');
            },
            error: (err) => console.error('Copy failed', err)
          });
        }
        break;

      case 'delete':
        if (activeObject) {
          activeObject.destroy();
          this.transformer.nodes([]);
          this.saveStateToBackend('delete');
        }
        break;

      case 'clear':
        this.mainLayer.destroyChildren();
        this.mainLayer.add(this.transformer);
        this.transformer.nodes([]);
        this.saveStateToBackend('clear');
        break;

      case 'undo':
        this.performUndo();
        break;

      case 'redo':
        this.performRedo();
        break;
    }
  }

  private changeColor(color: string): void {
    if (!this.stage) return;
    const selectedNodes = this.transformer.nodes();
    if (selectedNodes.length > 0) {
      selectedNodes.forEach(node => {
        node.setAttrs({ fill: color, stroke: color });
      });
      this.mainLayer.batchDraw();
      this.saveStateToBackend('color_change');
    }
  }

  private saveStateToBackend(actionType: string): void {
    if (!this.stage) return;
    const stageJSON = this.stage.toJSON();
    this.http.post(`${this.BACKEND_URL}/action`, {
      action: actionType,
      state: stageJSON
    }).subscribe({
      next: () => console.log(`State saved: ${actionType}`),
      error: (err) => console.error('Error saving state', err)
    });
  }

  private performUndo(): void {
    this.http.post(`${this.BACKEND_URL}/undo`, {}).subscribe({
      next: (state: any) => { if (state) this.loadCanvasState(state); },
      error: (err) => console.error('Undo failed', err)
    });
  }

  private performRedo(): void {
    this.http.post(`${this.BACKEND_URL}/redo`, {}).subscribe({
      next: (state: any) => { if (state) this.loadCanvasState(state); },
      error: (err) => console.error('Redo failed', err)
    });
  }

  private loadCanvasState(jsonState: any): void {
    const container = this.getContainer();
    if (!container) return;

    this.stage.destroyChildren();

    const newStage = Konva.Node.create(jsonState, container) as Konva.Stage;
    this.stage = newStage;

    const layers = this.stage.find('Layer') as Konva.Layer[];

    this.mainLayer = layers.find(l => l.getChildren().length > 0 && !l.findOne('#board-background')) as Konva.Layer;
    if (!this.mainLayer) {
      this.mainLayer = new Konva.Layer();
      this.stage.add(this.mainLayer);
    }

    this.gridLayer = layers.find(l => !!l.findOne('#board-background')) as Konva.Layer;
    if (!this.gridLayer) {
      this.gridLayer = new Konva.Layer();
      this.stage.add(this.gridLayer);
      this.gridLayer.moveToBottom();
    }

    this.transformer = new Konva.Transformer();
    this.mainLayer.add(this.transformer);

    this.initKonvaEvents();
    this.drawGrid();
  }

  private exportFile(type: string, fileName: string): void {
    if (!this.stage) return;
    const canvasData = this.stage.toJSON();
    this.http.post(`${this.BACKEND_URL}/export`, { name: fileName, type, data: canvasData })
      .subscribe(res => console.log('File exported', res));
  }

  private uploadFile(file: File): void {
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      this.loadCanvasState(content);
      this.saveStateToBackend('file_loaded');
    };
    reader.readAsText(file);
  }
}
