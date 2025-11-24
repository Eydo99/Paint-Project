import { Component, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import Konva from 'konva';
import { Subscription } from 'rxjs';
import { ShapeToolService } from '../../service/shape-tool.service';
import { ColorService } from '../../service/color.service';
import { CanvasService } from '../../service/canvas.service'; // you have this service in the project

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css'],
  providers: [ShapeToolService]
})
export class BoardComponent implements AfterViewInit, OnDestroy {
  private stage!: Konva.Stage;
  private layer!: Konva.Layer;
  private uiLayer!: Konva.Layer;
  private gridLayer!: Konva.Layer;

  // preview shape while drawing
  private tempShape: Konva.Shape | null = null;

  // transformer (selection)
  private transformer: Konva.Transformer | null = null;
  private selectedShape: Konva.Shape | null = null;

  // drawing state
  private drawing = false;
  private startPoint: { x: number; y: number } | null = null;

<<<<<<< HEAD
  // grid + zoom (kept from earlier)
=======

  private subscriptions: Subscription = new Subscription();
  private readonly BACKEND_URL = 'http://localhost:8080/api';

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
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
  gridless = true;
  private gridSize = 20;
  zoomLevels = [
    { label: 'Fit', value: 'fit' },
    { label: '50%', value: '0.5' },
    { label: '100%', value: '1' },
    { label: '200%', value: '2' },
    { label: '300%', value: '3' },
    { label: '500%', value: '5' }
  ];
  private currentZoom = 1;

  // tool from toolbar (move/resize/draw shapes, etc.)
  currentTool:
    | 'select'
    | 'move'
    | 'resize'
    | 'rectangle'
    | 'square'
    | 'circle'
    | 'ellipse'
    | 'triangle'
    | 'line' = 'select';

  private subs: Subscription[] = [];

  constructor(
    private shapeTool: ShapeToolService,
    private colorSrv: ColorService,
    private canvasSvc: CanvasService
  ) {}

  ngAfterViewInit(): void {
    this.stage = new Konva.Stage({
      container: 'board-container',
      width: 960,
      height: 720
    });

    this.gridLayer = new Konva.Layer();
    this.layer = new Konva.Layer();
    this.uiLayer = new Konva.Layer();

    this.stage.add(this.gridLayer);
    this.stage.add(this.layer);
    this.stage.add(this.uiLayer);

    this.createGrid();
    this.createTransformer();
    this.attachPointerEvents();

    // subscribe to tool changes published by toolbar/canvas service
    if ((this.canvasSvc as any).tool$) {
      this.subs.push(
        (this.canvasSvc as any).tool$.subscribe((t: string) => {
          this.setTool(t as any);
        })
      );
    } else if ((this.canvasSvc as any).getTool) {
      try {
        const initial = (this.canvasSvc as any).getTool();
        if (initial) this.setTool(initial);
      } catch {}
    }
  }

  ngOnDestroy(): void {
    this.subs.forEach(s => s.unsubscribe());
  }

  // ---------------- Grid ----------------
  private createGrid() {
    const size = this.gridSize;
    const w = this.stage.width();
    const h = this.stage.height();

<<<<<<< HEAD
    for (let x = 0; x <= w; x += size) {
      this.gridLayer.add(
        new Konva.Line({
          points: [x, 0, x, h],
          stroke: '#e6e6e6',
          strokeWidth: 1
        })
      );
    }

    for (let y = 0; y <= h; y += size) {
      this.gridLayer.add(
        new Konva.Line({
          points: [0, y, w, y],
          stroke: '#e6e6e6',
          strokeWidth: 1
        })
      );
=======
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
    this.stage.on('dragend transformend', (e) => {
      const target = e.target;
      // تأكد أن الهدف ليس الـ stage نفسه أو الخلفية وأنه Shape
      if (this.isShape(target)) {
        this.updateShapePositionInBackend(target);
      }
    });

  }



  // ✨ NEW: Type guard to check if a node is a Shape
  private isShape(node: Konva.Node): node is Konva.Shape {
    return node instanceof Konva.Shape &&
      !(node instanceof Konva.Stage) &&
      !(node instanceof Konva.Layer) &&
      node.id() !== 'board-background';
  }

// ✨ NEW: Type guard to check if a node is a Shape for formatShapeData
  private isShapeForFormat(node: Konva.Node): node is Konva.Shape {
    return node instanceof Konva.Shape &&
      !(node instanceof Konva.Stage) &&
      !(node instanceof Konva.Layer);
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
          height: 0,     // نبدأ بارتفاع 0
          shapeType: 'rectangle'  // ✨ NEW: Set custom attribute
        });

      case 'square':
        // مربع: العرض = الارتفاع
        return new Konva.Rect({
          ...defaultConfig,
          width: 0,
          height: 0,
          shapeType: 'square'  // ✨ NEW: Set custom attribute
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
        // مست  طيل: عرض وارتفاع حر
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
    // جهز البيانات اللي هتتبعت حسب الصيغة المطلوبة
    const shapeData = this.formatShapeData(shape);

    console.log('Sending shape to backend:', shapeData);

    // ابعت للـ backend
    this.http.post(`${this.BACKEND_URL}/shape`, shapeData).subscribe({
      next: (response) => {
        console.log('Shape saved successfully:', response);
        // لو الـ backend رجع ID، احفظه في الشكل
        if (response && (response as any).id) {
          shape.setAttr('id', (response as any).id);
        }
      },
      error: (err) => {
        console.error('Failed to save shape:', err);
      }
    });
  }

  // ✨ NEW: Format shape data according to backend requirements (تنسيق بيانات الشكل حسب متطلبات الـ backend)
  // ✨ NEW: Format shape data according to backend requirements (تنسيق بيانات الشكل حسب متطلبات الـ backend)
  private formatShapeData(node: Konva.Node): any {
    // تأكد أن الـ node هو Shape
    if (!this.isShapeForFormat(node)) {
      console.warn('Cannot format data for non-shape node:', node);
      return null;
    }

    const shape = node as Konva.Shape;
    const baseData = {
      fillColor: shape.attrs.fill || '#ffffff',
      outlineColor: shape.attrs.stroke || '#090101',
      strokeWidth: shape.attrs.strokeWidth || 2,
      x: shape.attrs.x || 0,
      y: shape.attrs.y || 0
    };

    // احسب مركز الشكل
    let centerX = 0;
    let centerY = 0;

    if (shape instanceof Konva.Rect) {
      centerX = shape.attrs.x + (shape.attrs.width / 2);
      centerY = shape.attrs.y + (shape.attrs.height / 2);

      // تحقق إذا كان مربعاً من خلال الـ shapeType المخصص
      const shapeType = shape.getAttr('shapeType');
      if (shapeType === 'square') {
        return {
          ...baseData,
          type: 'square',
          centerX: centerX,
          centerY: centerY
        };
      } else {
        return {
          ...baseData,
          type: 'rectangle',
          centerX: centerX,
          centerY: centerY
        };
      }
    }
    else if (shape instanceof Konva.Circle) {
      centerX = shape.attrs.x;
      centerY = shape.attrs.y;
      return {
        ...baseData,
        type: 'circle',
        centerX: centerX,
        centerY: centerY
      };
    }
    else if (shape instanceof Konva.Ellipse) {
      centerX = shape.attrs.x;
      centerY = shape.attrs.y;
      return {
        ...baseData,
        type: 'ellipse',
        centerX: centerX,
        centerY: centerY
      };
    }
    else if (shape instanceof Konva.Line) {
      // للخط، استخدم نقطة البداية كـ x,y والنهاية كـ center
      const points = shape.attrs.points || [0, 0, 0, 0];
      centerX = points[2] || 0;
      centerY = points[3] || 0;
      return {
        ...baseData,
        type: 'line',
        centerX: centerX,
        centerY: centerY
      };
    }
    else if (shape instanceof Konva.RegularPolygon && shape.attrs.sides === 3) {
      centerX = shape.attrs.x;
      centerY = shape.attrs.y;
      return {
        ...baseData,
        type: 'triangle',
        centerX: centerX,
        centerY: centerY
      };
    }

    // افتراضي: ارجع البيانات الأساسية
    return {
      ...baseData,
      type: shape.getClassName().toLowerCase(),
      centerX: centerX,
      centerY: centerY,
      angle: shape.attrs.rotation || 0  // ✨ ADD THIS LINE
    };
  }
  // ✨ NEW: Update shape position in backend (تحديث موضع الشكل في الـ backend)
  private updateShapePositionInBackend(shape: Konva.Shape): void {
    const shapeId = shape.getAttr('id');
    if (!shapeId) return;

    let centerX = 0;
    let centerY = 0;

    // احسب المركز بناءً على نوع الشكل
    if (shape instanceof Konva.Rect) {
      centerX = shape.attrs.x + (shape.attrs.width / 2);
      centerY = shape.attrs.y + (shape.attrs.height / 2);
    }
    else if (shape instanceof Konva.Circle || shape instanceof Konva.Ellipse ||
      shape instanceof Konva.RegularPolygon) {
      centerX = shape.attrs.x;
      centerY = shape.attrs.y;
    }
    else if (shape instanceof Konva.Line) {
      const points = shape.attrs.points || [0, 0, 0, 0];
      centerX = points[2] || 0;
      centerY = points[3] || 0;
    }

    const updateData = {
      id: shapeId,
      x: shape.attrs.x || 0,
      y: shape.attrs.y || 0,
      centerX: centerX,
      centerY: centerY
    };

    console.log('Updating shape position in backend:', updateData);

    // ابعت تحديث الموضع للـ backend
    this.http.post(`${this.BACKEND_URL}/move`, updateData).subscribe({
      next: (response) => {
        console.log('Shape position updated successfully:', response);
      },
      error: (err) => {
        console.error('Failed to update shape position:', err);
      }
    });
  }
  // ✨ NEW: Method to receive tool change from toolbar (استقبال تغيير الأداة من الـ toolbar)
  onToolChange(tool: string): void {
    this.activeTool = tool;

    // لو رجعنا لـ select mode، الغي الاختيار
    if (tool === 'select') {
      this.transformer.nodes([]);
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
    }

    this.gridLayer.visible(!this.gridless);
    this.gridLayer.draw();
  }

  toggleGrid() {
    this.gridless = !this.gridless;
    this.gridLayer.visible(!this.gridless);
    this.gridLayer.batchDraw();
  }

<<<<<<< HEAD
  // ---------------- Zoom ----------------
  onZoomSelect(event: any) {
    const value = event.target.value;
    if (value === 'fit') {
      this.fitToScreen();
      return;
=======
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
        if (activeObject && this.isShapeForFormat(activeObject)) {
          // استخدم الصيغة الجديدة لبيانات الشكل
          const shapeData = this.formatShapeData(activeObject);
          if (shapeData) {
            this.http.post(`${this.BACKEND_URL}/copy`, shapeData).subscribe({
              next: (copiedShapeData: any) => {
                // استخدم Konva.Shape.create بدلاً من Konva.Node.create
                const newShape = Konva.Shape.create(copiedShapeData);
                this.mainLayer.add(newShape);
                this.transformer.nodes([newShape]);
                // احفظ ID الجديد إذا كان موجوداً في الرد
                if (copiedShapeData.id) {
                  newShape.setAttr('id', copiedShapeData.id);
                }
              },
              error: (err) => console.error('Copy failed', err)
            });
          }
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
>>>>>>> 7a635d5fa7e0f7a12b1651ad7ca2ff1f5c451416
    }
    const z = parseFloat(value);
    if (!isNaN(z)) this.setZoom(z);
  }

  private setZoom(scale: number) {
    const old = this.currentZoom || 1;
    this.currentZoom = scale;

    const center = { x: this.stage.width() / 2, y: this.stage.height() / 2 };
    const mousePointTo = {
      x: (center.x - this.stage.x()) / old,
      y: (center.y - this.stage.y()) / old
    };

    this.stage.scale({ x: scale, y: scale });

    const newPos = {
      x: center.x - mousePointTo.x * scale,
      y: center.y - mousePointTo.y * scale
    };

    this.stage.position(newPos);
    this.stage.batchDraw();
  }

  private fitToScreen() {
    const sw = this.stage.width();
    const sh = this.stage.height();
    const bw = 960;
    const bh = 720;
    const newZoom = Math.min(sw / bw, sh / bh);
    this.setZoom(newZoom);
  }

  // ---------------- Transformer & selection ----------------
  private createTransformer() {
    this.transformer = new Konva.Transformer({
      rotateEnabled: true,
      enabledAnchors: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
      anchorSize: 8,
      borderDash: [6, 4]
    });
    // place on uiLayer so it appears above shapes
    this.uiLayer.add(this.transformer);
    this.transformer.hide();
    this.uiLayer.draw();
  }

  private selectShape(node: Konva.Shape | null) {
    // deselect previous
    if (this.selectedShape && this.selectedShape !== node) {
      if (this.transformer) {
        this.transformer.nodes([]);
        this.transformer.hide();
      }
    }

    this.selectedShape = node;

    if (!node) {
      if (this.transformer) {
        this.transformer.nodes([]);
        this.transformer.hide();
      }
      return;
    }

    // attach transformer
    if (this.transformer) {
      this.transformer.nodes([node]);
      this.transformer.show();
      this.uiLayer.batchDraw();
    }
  }

  // ---------------- Attach events + drawing (preview preserved) ----------------
  private attachPointerEvents() {
    // stage click: deselect when clicking background
    this.stage.on('click tap', (e) => {
      const target = e.target;

      // If clicked one of the stage/layers (empty board), deselect
      // Use includes + any cast to avoid TS union mismatch
      if ([this.stage, this.gridLayer, this.layer, this.uiLayer].includes(target as any)) {
        this.selectShape(null);
        return;
      }

      // clicking on a shape should select it (if move/resize/select modes)
      if (target && (target as any).getClassName && (target as any).getClassName() !== 'Stage') {
        const node = target as Konva.Shape;
        if (this.currentTool === 'select' || this.currentTool === 'move' || this.currentTool === 'resize') {
          this.selectShape(node);
        }
      }
    });

    // allow dragging with move tool: shapes become draggable by default when created,
    // but we only allow transform when tool is resize, otherwise transformer disabled anchors.
    // We preserve the existing drawing preview & creation flow (as before)
    this.stage.on('mousedown touchstart', () => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      // If the current tool is a drawing tool, start drawing logic (preserve earlier behavior)
      if (['rectangle', 'square', 'circle', 'ellipse', 'triangle', 'line'].includes(this.currentTool)) {
        this.drawing = true;
        this.startPoint = { x: pos.x, y: pos.y };
        if (this.tempShape) { this.tempShape.destroy(); this.tempShape = null; }
        return;
      }
    });

    // pointer move: preview shape if drawing
    this.stage.on('mousemove touchmove', () => {
      if (!this.drawing || !this.startPoint) return;
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      if (this.tempShape) { this.tempShape.destroy(); this.tempShape = null; }

      const preview = {
        fill: this.colorSrv.fillColorPreview(),
        stroke: this.colorSrv.strokeColor,
        strokeWidth: this.colorSrv.strokeWidth,
        dash: [6, 4],
        opacity: 0.6
      };

      const start = this.startPoint;
      const end = pos;

      switch (this.currentTool) {
        case 'rectangle':
        case 'square': {
          const x = Math.min(start.x, end.x);
          const y = Math.min(start.y, end.y);
          let width = Math.abs(end.x - start.x);
          let height = Math.abs(end.y - start.y);
          if (this.currentTool === 'square') {
            const side = Math.min(width, height);
            width = height = side;
          }
          this.tempShape = (new Konva.Rect({
            x, y, width, height,
            fill: preview.fill,
            stroke: preview.stroke,
            strokeWidth: preview.strokeWidth,
            dash: preview.dash,
            opacity: preview.opacity
          }) as unknown) as Konva.Shape;
          break;
        }
        case 'circle': {
          const dx = end.x - start.x;
          const dy = end.y - start.y;
          const radius = Math.sqrt(dx * dx + dy * dy) / 2;
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          this.tempShape = (new Konva.Circle({
            x: cx, y: cy, radius,
            fill: preview.fill,
            stroke: preview.stroke,
            strokeWidth: preview.strokeWidth,
            dash: preview.dash,
            opacity: preview.opacity
          }) as unknown) as Konva.Shape;
          break;
        }
        case 'ellipse': {
          const rx = Math.abs(end.x - start.x) / 2;
          const ry = Math.abs(end.y - start.y) / 2;
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          this.tempShape = (new Konva.Ellipse({
            x: cx, y: cy, radiusX: rx, radiusY: ry,
            fill: preview.fill,
            stroke: preview.stroke,
            strokeWidth: preview.strokeWidth,
            dash: preview.dash,
            opacity: preview.opacity
          }) as unknown) as Konva.Shape;
          break;
        }
        case 'triangle': {
          const rx = Math.abs(end.x - start.x) / 2;
          const ry = Math.abs(end.y - start.y) / 2;
          const radius = Math.max(rx, ry);
          const cx = (start.x + end.x) / 2;
          const cy = (start.y + end.y) / 2;
          this.tempShape = (new Konva.RegularPolygon({
            x: cx, y: cy, sides: 3, radius,
            fill: preview.fill, stroke: preview.stroke,
            strokeWidth: preview.strokeWidth, dash: preview.dash,
            opacity: preview.opacity
          }) as unknown) as Konva.Shape;
          break;
        }
        case 'line': {
          this.tempShape = (new Konva.Line({
            points: [start.x, start.y, end.x, end.y],
            stroke: preview.stroke, strokeWidth: preview.strokeWidth,
            dash: preview.dash, lineCap: 'round', lineJoin: 'round',
            opacity: preview.opacity
          }) as unknown) as Konva.Shape;
          break;
        }
      }

      if (this.tempShape) {
        this.uiLayer.add(this.tempShape);
        this.uiLayer.batchDraw();
      }
    });

    // pointer up: finalize creation OR if move/resize mode, nothing special here (drag/transform handled per node)
    this.stage.on('mouseup touchend', () => {
      // finalize drawing
      if (!this.drawing || !this.startPoint) {
        this.drawing = false;
        return;
      }
      this.drawing = false;
      const pos = this.stage.getPointerPosition();
      if (!pos) {
        if (this.tempShape) { this.tempShape.destroy(); this.tempShape = null; this.uiLayer.batchDraw(); }
        return;
      }

      const topLeft = { x: Math.min(this.startPoint.x, pos.x), y: Math.min(this.startPoint.y, pos.y) };
      const bottomRight = { x: Math.max(this.startPoint.x, pos.x), y: Math.max(this.startPoint.y, pos.y) };
      const center = { x: (this.startPoint.x + pos.x) / 2, y: (this.startPoint.y + pos.y) / 2 };

      const payload: any = {
        type: this.currentTool,
        topLeft,
        bottomRight,
        center,
        fillColor: this.colorSrv.fillColor,
        outlineColor: this.colorSrv.strokeColor,
        strokeWidth: this.colorSrv.strokeWidth
      };

      const tempRef = this.tempShape;
      const sub = this.shapeTool.sendShapeToBackend(payload).subscribe({
        next: (backendShape) => {
          if (tempRef) tempRef.destroy();
          // create Konva node from backend canonical shape
          const real = this.shapeTool.createKonvaFromBackend(backendShape) as unknown as Konva.Shape;
          // attach id and events then add to layer
          this.setupRealShape(real, backendShape);
          this.layer.add(real);
          this.layer.batchDraw();
        },
        error: (err) => {
          console.error('Create failed', err);
          if (tempRef) { tempRef.destroy(); this.uiLayer.batchDraw(); }
        },
        complete: () => {
          this.tempShape = null;
        }
      });
      this.subs.push(sub);
    });
  }

  // ---------------- setup events for the shape (move, resize, selection)
  private setupRealShape(node: Konva.Shape, backendShape: any) {
    // ensure node has an id attribute (store backend id)
    if (backendShape.id != null) {
      try { node.id(String(backendShape.id)); } catch {}
      (node as any).attrs._shapeId = backendShape.id;
    }

    node.draggable(this.currentTool === 'move' || this.currentTool === 'select');

    node.on('click tap', (e) => {
      e.cancelBubble = true; // prevent stage click handler
      this.selectShape(node);
    });

    node.on('dragend', () => {
      const x = node.x();
      const y = node.y();
      const bbox = node.getClientRect({ relativeTo: this.layer });

      const updatePayload: any = {
        id: (node as any).attrs._shapeId ?? node.id(),
        x,
        y,
        centerX: x + (bbox.width / 2),
        centerY: y + (bbox.height / 2)
      };

      this.shapeTool.updateShape(updatePayload).subscribe({
        next: () => {},
        error: (err) => console.error('update move failed', err)
      });
    });

    node.on('transformend', () => {
      const scaleX = node.scaleX();
      const scaleY = node.scaleY();

      // width/height inference
      let width = (node.width ? node.width() : (node.getClientRect().width || 0)) * scaleX;
      let height = (node.height ? node.height() : (node.getClientRect().height || 0)) * scaleY;

      node.scaleX(1);
      node.scaleY(1);

      const x = node.x();
      const y = node.y();
      const rotation = node.rotation();

      const bbox = node.getClientRect();

      const payload: any = {
        id: (node as any).attrs._shapeId ?? node.id(),
        x,
        y,
        width,
        height,
        rotation,
        centerX: x + bbox.width / 2,
        centerY: y + bbox.height / 2,
        properties: {}
      };

      const cls = node.getClassName();
      if (cls === 'Rect') {
        payload.properties = { width, height };
      } else if (cls === 'Circle') {
        payload.properties = { radius: (width + height) / 4 };
        payload.centerX = node.x();
        payload.centerY = node.y();
      } else if (cls === 'Ellipse') {
        payload.properties = { radiusX: width / 2, radiusY: height / 2 };
        payload.centerX = node.x();
        payload.centerY = node.y();
      } else if (cls === 'RegularPolygon' && (node as any).sides === 3) {
        payload.properties = { radius: Math.max(width, height) / 2 };
      }

      this.shapeTool.updateShape(payload).subscribe({
        next: () => {},
        error: (err) => console.error('transform update failed', err)
      });
    });

    node.draggable(true);
  }

  // allow external switching of tools
  setTool(tool: typeof this.currentTool) {
  this.currentTool = tool;

  // Konva returns a Node[] (Group | Shape)
  const childrenArray = this.layer.getChildren(); 

  childrenArray.forEach((child: Konva.Node) => {

    // Only shapes should be draggable
    if (child instanceof Konva.Shape) {
      if (this.currentTool === 'move') {
        child.draggable(true);
      } else if (this.currentTool === 'select') {
        child.draggable(true);
      } else {
        child.draggable(false);
      }
    }
  });

  // Transformer control visibility
  if (this.transformer) {
    if (
      this.currentTool === 'resize' ||
      this.currentTool === 'select' ||
      this.currentTool === 'move'
    ) {
      // allow transformer
    } else {
      this.transformer.hide();
      this.uiLayer.batchDraw();
    }
  }
}

}
