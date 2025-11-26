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
  private readonly BACKEND_URL = 'http://localhost:8080/api/shape';


  undoAvailable = false;
  redoAvailable = false;

  private isEditingText=false;



  // logical drawing area
  canvasWidth = 960;
  canvasHeight = 720;
  backgroundColor = '#ffffff';

  // ✨ NEW: Active tool from toolbar (الأداة النشطة من الـ Toolbar)
  activeTool: string = 'select';
  canSelect: boolean = false;      // Can select shapes
  canMove: boolean = false;        // Can move shapes
  canResize: boolean = false;      // Can resize shapes
  canRotate: boolean = false;      // Can rotate shapes
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
  ) { }

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

  // ✨ UPDATE initKonvaEvents() - Add this at the beginning of the method:
  private initKonvaEvents() {
    this.stage.on('click tap', (e) => {
      // Allow selection in select, move, resize, and rotate modes
      if (!['select', 'move', 'resize', 'rotate'].includes(this.activeTool)) {
        this.transformer.nodes([]);
        this.notifyShapeSelection(null); // ✨ NEW: Notify deselection
        return;
      }

      if (e.target === this.stage || e.target.id() === 'board-background') {
        this.transformer.nodes([]);
        this.notifyShapeSelection(null); // ✨ NEW: Notify deselection
        return;
      }

      if (e.target.getParent()?.className !== 'Transformer') {
        this.transformer.nodes([e.target]);
        // ✨ NEW: Notify selection
        if (this.isShape(e.target)) {
          this.notifyShapeSelection(e.target as Konva.Shape);
        }
      }
    });

    // âœ¨ Mouse down - Start drawing (only for drawing tools)
    this.stage.on('mousedown touchstart', (e) => {
      if (this.isPanning) return;

      // Don't draw in select, move, resize, or rotate modes
      if (['select', 'move', 'resize', 'rotate'].includes(this.activeTool)) {
        return;
      }


      if (['select', 'move', 'resize', 'rotate'].includes(this.activeTool)) {
        return;
      }






      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const canvasPos = this.getCanvasPosition(pos.x, pos.y);



      if (this.activeTool === 'text') {
        const textNode = this.createText(canvasPos.x, canvasPos.y);
        this.transformer.nodes([textNode]);
        this.sendShapeToBackend(textNode);
        return;
      }






      this.isDrawing = true;
      this.startX = canvasPos.x;
      this.startY = canvasPos.y;

      if (this.activeTool === 'pencil') {
        this.currentShape = this.createPencil(canvasPos.x, canvasPos.y);
      } else {
        this.currentShape = this.createShape(this.activeTool, canvasPos.x, canvasPos.y);
      }


      if (this.currentShape) {
        this.mainLayer.add(this.currentShape);
      }
    });

    // Mouse move and up remain the same...
    this.stage.on('mousemove touchmove', (e) => {
      if (!this.isDrawing || !this.currentShape) return;

      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const canvasPos = this.getCanvasPosition(pos.x, pos.y);

      // ✨ Pencil logic (add new points continuously)
      if (this.activeTool === 'pencil' && this.currentShape instanceof Konva.Line) {
        const newPoints = this.currentShape.points().concat([canvasPos.x, canvasPos.y]);
        this.currentShape.points(newPoints);
        this.mainLayer.batchDraw();
        return; // STOP, don't run updateShape()
      }

      // Normal shapes logic
      this.updateShape(this.currentShape, this.startX, this.startY, canvasPos.x, canvasPos.y);
    });



    this.stage.on('mouseup touchend', (e) => {
      if (!this.isDrawing || !this.currentShape) return;

      this.isDrawing = false;
      this.sendShapeToBackend(this.currentShape);
      this.transformer.nodes([this.currentShape]);
      this.currentShape = null;
    });



    // âœ… FIXED: Dragend - only if in 'move' mode
    this.stage.on('dragend', (e) => {
      const target = e.target;
      if (this.isShape(target) && this.activeTool === 'move') {
        console.log('✅ Shape moved');
        this.updateShapePositionInBackend(target);
      }
    });

    // âœ… FIXED: Transformend - works for both resize AND rotate
    this.transformer.on('transformend', (e) => {
      // ⚠️ IMPORTANT: e.target is the Transformer, not the shape!
      // We need to get the actual transformed shapes from transformer.nodes()
      const transformedShapes = this.transformer.nodes();


      // Update each transformed shape
      transformedShapes.forEach(node => {
        if (this.isShape(node)) {
          console.log('✅ Shape transformed (resized or rotated)');
          console.log('📊 New shape data:', this.formatShapeData(node));
          this.updateShapePositionInBackend(node);
        }
      });
    });


    // ✨ NEW: Track mouse movement for status bar
    this.stage.on('mousemove', (e) => {
      const pos = this.stage.getPointerPosition();
      if (!pos) return;

      const canvasPos = this.getCanvasPosition(pos.x, pos.y);
      this.canvasService.updateMousePosition(
        Math.round(canvasPos.x),
        Math.round(canvasPos.y)
      );
    });
  }









  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ✨ NEW: Notify service when shape is selected
  private notifyShapeSelection(shape: Konva.Shape | null): void {
    if (!shape) {
      this.canvasService.selectShape(null);
      return;
    }

    // ✨ Handle text type in selection
    let shapeType = this.getShapeType(shape);
    if (shape instanceof Konva.Text) {
      shapeType = 'text'; // Explicitly set text type
    }

    const shapeData = {
      id: shape.getAttr('id') || shape._id.toString(),
      type: shapeType,
      fill: shape.attrs.fill || '#ffffff',
      stroke: shape.attrs.stroke || '#000000',
      strokeWidth: shape.attrs.strokeWidth || 2,
      width: this.getShapeWidth(shape),
      height: this.getShapeHeight(shape),
      x: shape.attrs.x || 0,
      y: shape.attrs.y || 0
    };

    this.canvasService.selectShape(shapeData);
  }

  // Helper to get shape type
  private getShapeType(shape: Konva.Shape): string {
    // ✨ NEW: Add text check first
    if (shape instanceof Konva.Text) {
      return 'text';
    }
    if (shape instanceof Konva.Rect) {
      return shape.getAttr('shapeType') || 'rectangle';
    } else if (shape instanceof Konva.Circle) {
      return 'circle';
    } else if (shape instanceof Konva.Ellipse) {
      return 'ellipse';
    } else if (shape instanceof Konva.Line) {
      return 'line';
    } else if (shape instanceof Konva.RegularPolygon && shape.attrs.sides === 3) {
      return 'triangle';
    }
    return 'unknown';
  }

  // Helper to get shape width
  private getShapeWidth(shape: Konva.Shape): number {
    if (shape instanceof Konva.Rect) {
      return shape.attrs.width * (shape.attrs.scaleX || 1);
    } else if (shape instanceof Konva.Circle) {
      return (shape.attrs.radius || 0) * 2 * (shape.attrs.scaleX || 1);
    } else if (shape instanceof Konva.Ellipse) {
      return (shape.attrs.radiusX || 0) * 2 * (shape.attrs.scaleX || 1);
    }
    return 0;
  }

  // Helper to get shape height
  private getShapeHeight(shape: Konva.Shape): number {
    if (shape instanceof Konva.Rect) {
      return shape.attrs.height * (shape.attrs.scaleY || 1);
    } else if (shape instanceof Konva.Circle) {
      return (shape.attrs.radius || 0) * 2 * (shape.attrs.scaleY || 1);
    } else if (shape instanceof Konva.Ellipse) {
      return (shape.attrs.radiusY || 0) * 2 * (shape.attrs.scaleY || 1);
    }
    return 0;
  }
  /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

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
  private getCanvasPosition(stageX: number, stageY: number): { x: number, y: number } {
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
      fill: this.canvasService.getDefaultFillColor(),      // لون التعبئة (ابيض)
      stroke: this.canvasService.getDefaultStrokeColor(),    // لون الحدود (أسود)
      strokeWidth: 2,
      draggable: false,     // يمكن سحب الشكل
      rotation: 0  // ✨ Add initial angle = 0
    };

    switch (tool) {
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
          radiusY: 0,
          listening: true
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
    x: 0,  // ✨ CHANGED: Set to 0 instead of x
    y: 0,  // ✨ CHANGED: Set to 0 instead of y
    points: [x, y, x, y],  // Points are now absolute coordinates
    fill: undefined,
    strokeWidth: 3,
    listening: true,
    lineCap: 'round',
    lineJoin: 'round'
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
    const shapeData = this.formatShapeData(shape);

    this.http.post(`${this.BACKEND_URL}`, shapeData).subscribe({
      next: (response) => {
        console.log('Shape saved successfully:', response);
        if (response && (response as any).id) {
          const shapeId = (response as any).id.toString();
          shape.id(shapeId); // ✅ Just set Konva's ID
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
    const angle = shape.attrs.rotation || 0;

    // ✨ NEW: Handle TEXT first (before other shapes)
    if (shape instanceof Konva.Text) {
      return {
        fillColor: shape.attrs.fill || '#ffffff',
        outlineColor: shape.attrs.stroke || '#090101',
        strokeWidth: shape.attrs.strokeWidth || 2,
        type: 'text',
        x: shape.attrs.x || 0,
        y: shape.attrs.y || 0,
        centerX: shape.attrs.x || 0,
        centerY: shape.attrs.y || 0,
        angle: angle,
        properties: {
          fontFamily: shape.attrs.fontFamily || 'Arial',
          fontSize: shape.attrs.fontSize || 28,
          fontStyle: shape.attrs.fontStyle || 'normal',
          content: shape.attrs.text || 'Text'
        }
      };
    }


    const baseData = {
      fillColor: shape.attrs.fill || '#ffffff',
      outlineColor: shape.attrs.stroke || '#090101',
      strokeWidth: shape.attrs.strokeWidth || 2,
      x: shape.attrs.x || 0,
      y: shape.attrs.y || 0,
      angle: angle
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
      const radius = shape.attrs.radius || 0;
      return {
        fillColor: shape.attrs.fill || '#ffffff',
        outlineColor: shape.attrs.stroke || '#090101',
        strokeWidth: shape.attrs.strokeWidth || 2,
        x: shape.attrs.x - radius,  // ✅ Top-left X
        y: shape.attrs.y - radius,
        type: 'circle',
        centerX: centerX,
        centerY: centerY,
        angle: angle  // ✨ Include angle
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
  // ✨ ENHANCED: Update shape position, rotation, AND properties in backend
  // Works for: dragend, transformend (resize + rotate)
  private updateShapePositionInBackend(shape: Konva.Shape): void {
    const shapeId = shape.getAttr('id');
    if (!shapeId) {
      console.warn('Shape has no ID, cannot update in backend');
      return;
    }

    let centerX = 0;
    let centerY = 0;
    let x = 0;
    let y = 0;
    let properties: any = {};

    // ✨ Get rotation angle
    const angle = shape.attrs.rotation || 0;


    if (shape instanceof Konva.Text) {
      x = shape.attrs.x || 0;
      y = shape.attrs.y || 0;
      centerX = x;
      centerY = y;

      properties = {
        fontFamily: shape.attrs.fontFamily || 'Arial',
        fontSize: shape.attrs.fontSize || 28,
        fontStyle: shape.attrs.fontStyle || 'normal',
        content: shape.attrs.text || 'Text'
      };

      const updateData = {
        id: shapeId,
        x: x,
        y: y,
        centerX: centerX,
        centerY: centerY,
        angle: angle,
        fillColor: shape.attrs.fill || '#ffffff',
        outlineColor: shape.attrs.stroke || '#090101',
        strokeWidth: shape.attrs.strokeWidth || 2,
        type: 'text',
        properties: properties
      };

      console.log('📝 Updating text in backend:', updateData);

      this.http.put(`${this.BACKEND_URL}/updateShape`, updateData).subscribe({
        next: (response) => {
          console.log('✅ Text updated successfully in backend:', response);
        },
        error: (err) => {
          console.error('❌ Failed to update text in backend:', err);
        }
      });
      return; // ✨ Important: exit here for text
    }



    // Calculate center and properties based on shape type
    if (shape instanceof Konva.Rect) {
      const width = shape.attrs.width * (shape.attrs.scaleX || 1);  // ✨ Account for scale
      const height = shape.attrs.height * (shape.attrs.scaleY || 1);

      x = shape.attrs.x || 0;
      y = shape.attrs.y || 0;
      centerX = x + (width / 2);
      centerY = y + (height / 2);

      const shapeType = shape.getAttr('shapeType');
      if (shapeType === 'square') {
        properties = {
          sideLength: width
        };
      } else {
        properties = {
          length: height,
          width: width
        };
      }
    }
    else if (shape instanceof Konva.Circle) {
      const radius = (shape.attrs.radius || 0) * (shape.attrs.scaleX || 1);  // ✨ Account for scale

      centerX = shape.attrs.x || 0;
      centerY = shape.attrs.y || 0;
      x = centerX - radius;
      y = centerY - radius;

      properties = {
        radius: radius
      };
    }
    else if (shape instanceof Konva.Ellipse) {
      const radiusX = (shape.attrs.radiusX || 0) * (shape.attrs.scaleX || 1);  // ✨ Account for scale
      const radiusY = (shape.attrs.radiusY || 0) * (shape.attrs.scaleY || 1);

      centerX = shape.attrs.x || 0;
      centerY = shape.attrs.y || 0;
      x = centerX - radiusX;
      y = centerY - radiusY;

      properties = {
        radiusX: radiusX,
        radiusY: radiusY
      };
    }
    else if (shape instanceof Konva.Line) {
      const points = shape.attrs.points || [0, 0, 0, 0];

      x = points[0] || 0;
      y = points[1] || 0;

      const xEnd = points[2] || 0;
      const yEnd = points[3] || 0;

      centerX = (x + xEnd) / 2;
      centerY = (y + yEnd) / 2;

      const length = Math.sqrt(
        Math.pow(xEnd - x, 2) + Math.pow(yEnd - y, 2)
      );

      properties = {
        xEnd: xEnd,
        yEnd: yEnd,
        length: length
      };
    }
    else if (shape instanceof Konva.RegularPolygon && shape.attrs.sides === 3) {
      const radius = (shape.attrs.radius || 0) * (shape.attrs.scaleX || 1);  // ✨ Account for scale

      centerX = shape.attrs.x || 0;
      centerY = shape.attrs.y || 0;

      x = centerX - radius;
      y = centerY - radius;

      const base = Math.sqrt(3) * radius;
      const height = 1.5 * radius;

      properties = {
        base: base,
        height: height
      };
    }

    const updateData = {
      id: shapeId,
      x: x,
      y: y,
      centerX: centerX,
      centerY: centerY,
      angle: angle,
      fillColor: shape.attrs.fill || '#ffffff',      // ✨ اللون الداخلي
      outlineColor: shape.attrs.stroke || '#090101',  // ✨ لون الحدود
      strokeWidth: shape.attrs.strokeWidth || 2,      // ✨ عرض الحدود
      properties: properties
    };

    // console.log(' Updating shape in backend:');
    // console.log('  Shape ID:', shapeId);
    // console.log('  Position: (x:', x, ', y:', y, ')');
    // console.log('  Center: (', centerX, ',', centerY, ')');
    // console.log('  Angle:', angle, '°');
    // console.log('  Properties:', properties);
    console.log('  Full data:', updateData);

    this.http.put(`${this.BACKEND_URL}/updateShape`, updateData).subscribe({
      next: (response) => {
        console.log('✅ Shape updated successfully in backend:', response);
      },
      error: (err) => {
        console.error('❌ Failed to update shape in backend:', err);
      }
    });
  }


 startEditingText(textNode: Konva.Text) {
  // ✅ Prevent starting a new edit if already editing
  if (this.isEditingText) {
    return;
  }

  this.isEditingText = true;

  // Remove transformer while editing
  this.transformer.nodes([]);

  const textarea = document.createElement("textarea");
  textarea.value = textNode.text();
  textarea.style.position = "absolute";
  textarea.style.background = "white";
  textarea.style.border = "1px solid #888";
  textarea.style.padding = "4px";
  textarea.style.zIndex = "9999";
  textarea.style.resize = "none";
  textarea.style.fontSize = textNode.fontSize() + "px";
  textarea.style.fontFamily = textNode.fontFamily();
  textarea.style.lineHeight = textNode.lineHeight().toString();

  // Position textarea exactly on top of the text
  const textPosition = textNode.getClientRect();
  const stageBox = this.stage.container().getBoundingClientRect();

  const minWidth = 150;
  const minHeight = 50;

  textarea.style.width = Math.max(textPosition.width + 40, minWidth) + "px";
  textarea.style.height = Math.max(textPosition.height + 30, minHeight) + "px";

  textarea.style.left = stageBox.left + textPosition.x + "px";
  textarea.style.top = stageBox.top + textPosition.y + "px";

  document.body.appendChild(textarea);
  textarea.focus();

  // ✅ Use a flag to ensure finishEditing is only called once
  let editingFinished = false;

  const finishEditing = () => {
    if (editingFinished) return;
    editingFinished = true;

    // ✅ Check if textarea still exists in DOM before removing
    if (textarea.parentNode) {
      textarea.parentNode.removeChild(textarea);
    }

    textNode.text(textarea.value);
    textNode.show();
    this.mainLayer.draw();
    this.updateShapePositionInBackend(textNode);
    
    this.isEditingText = false; // ✅ Reset flag
  };

  textarea.addEventListener("blur", finishEditing);

  textarea.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finishEditing();
    }
    if (e.key === "Escape") {
      finishEditing();
    }
  });
}


  createText(x: number, y: number): Konva.Text {
    const textNode = new Konva.Text({
      text: "Text",
      x,
      y,
      fontSize: 28,
      fontFamily: "Arial",
      fontStyle: "normal",
      fill: this.canvasService.getDefaultFillColor(),
      draggable: true,
      padding: 4

    });





    textNode.on("dragend", () => {
      this.updateShapePositionInBackend(textNode);
    });

    textNode.on("transformend", () => {
      // Get the scale values
      const scaleX = textNode.scaleX();
      const scaleY = textNode.scaleY();

      // Use the average scale to maintain aspect ratio
      const scale = Math.max(scaleX, scaleY);

      // Calculate new font size based on scale
      const newFontSize = Math.max(10, textNode.fontSize() * scale);

      // Apply new font size
      textNode.fontSize(newFontSize);

      // Reset scale to 1 to prevent cumulative scaling
      textNode.scaleX(1);
      textNode.scaleY(1);

      // Let Konva auto-calculate the text box dimensions
      // DO NOT manually set width/height - this causes the huge box

      // Redraw the layer
      this.mainLayer.batchDraw();

      // Update backend
      this.sendShapeToBackend(textNode);
    });

    // -----------------------------
    // SELECTION
    // -----------------------------
    // =====================
    // TEXT SELECTION LOGIC
    // =====================
    textNode.on("click", () => {

      // Attach selection
      this.transformer.nodes([textNode]);

      // Apply mode behavior
      switch (this.activeTool) {

        case "select":
          textNode.draggable(false);
          this.transformer.enabledAnchors([]);
          this.transformer.rotateEnabled(false);
          break;

        case "move":
          textNode.draggable(true);
          this.transformer.enabledAnchors([]);
          this.transformer.rotateEnabled(false);
          break;

        case "resize":
          textNode.draggable(false);
          this.transformer.enabledAnchors([
            "top-left", "top-center", "top-right",
            "middle-left", "middle-right",
            "bottom-left", "bottom-center", "bottom-right"
          ]);
          this.transformer.rotateEnabled(false);
          break;

        case "rotate":
          textNode.draggable(false);
          this.transformer.enabledAnchors([]);
          this.transformer.rotateEnabled(true);
          break;
      }

      // Update property panel
      this.canvasService.selectShape({
        id: textNode.id(),
        type: "text",
        fill: textNode.fill(),
        width: textNode.width(),
        height: textNode.height(),
        x: textNode.x(),
        y: textNode.y(),
        angle: textNode.rotation()
      });

      this.mainLayer.batchDraw();
    });


    // -----------------------------
    // EDITING (DOUBLE CLICK)
    // -----------------------------
    textNode.on("dblclick", () => {
      this.startEditingText(textNode);
    });

    // -----------------------------
    // DRAG END → backend
    // -----------------------------
    textNode.on("dragend", () => {
      this.updateShapePositionInBackend(textNode);
    });

    // -----------------------------
    // TRANSFORM END → backend
    // -----------------------------
    this.transformer.on("transformend", () => {
      if (this.transformer.nodes().includes(textNode)) {
        this.updateShapePositionInBackend(textNode);
      }



      // Make text selectable the same way as shapes
      textNode.on("click tap", () => {
        if (['select', 'move', 'resize', 'rotate'].includes(this.activeTool)) {
          this.transformer.nodes([textNode]);
          this.canvasService.selectShape({
            id: textNode.id(),
            type: "text",
            fill: textNode.attrs.fill,
            stroke: "#000000",
            strokeWidth: 0,
            width: textNode.width(),
            height: textNode.height(),
            x: textNode.x(),
            y: textNode.y()
          });
        }
      }


      );



      if (this.activeTool === 'move') {
        textNode.draggable(true);
      } else {
        textNode.draggable(false);
      }






    });

    textNode.on("dblclick dbltap", () => {
      this.startEditingText(textNode);
    });

    this.mainLayer.add(textNode);
    this.mainLayer.draw();

    return textNode;





  }


  // ✨ NEW: Method to receive tool change from toolbar (استقبال تغيير الأداة من الـ toolbar)
  // âœ… FIXED: Method to receive tool change from toolbar
  onToolChange(tool: string): void {
    if (!this.transformer) {
      console.error('❌ Transformer not initialized');
      return;
    }
    this.activeTool = tool;

    // Reset all mode flags
    this.canSelect = false;
    this.canMove = false;
    this.canResize = false;
    this.canRotate = false;


    // Set transformer properties based on mode
    switch (tool) {
      case 'select':
        this.canSelect = true;
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
        this.transformer.borderEnabled(true);
        this.transformer.borderStroke('#0066ff');
        this.transformer.borderStrokeWidth(2);
        break;

      case 'move':
        this.canSelect = true;
        this.canMove = true;
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
        this.transformer.borderEnabled(true);
        this.transformer.borderStroke('#0066ff');
        this.transformer.borderStrokeWidth(2);
        // Enable dragging for all shapes
        this.mainLayer.children.forEach(child => {
          if (this.isShape(child)) {
            child.draggable(true);
          }
        });
        break;

      case 'resize':
        this.canSelect = true;
        this.canResize = true;
        // Enable all resize handles
        this.transformer.enabledAnchors([
          'top-left', 'top-center', 'top-right',
          'middle-right', 'middle-left',
          'bottom-left', 'bottom-center', 'bottom-right'
        ]);
        this.transformer.rotateEnabled(false);
        this.transformer.borderEnabled(true);
        this.transformer.borderStroke('#0066ff');
        this.transformer.borderStrokeWidth(2);
        // âœ… Keep shapes draggable even in resize mode (optional)
        // Or disable if you want resize-only interaction:
        this.mainLayer.children.forEach(child => {
          if (this.isShape(child)) {
            child.draggable(false); // Disable drag to avoid conflicts
          }
        });
        break;

      case 'rotate':
        this.canSelect = true;
        this.canRotate = true;
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(true);
        this.transformer.borderEnabled(true);
        this.transformer.borderStroke('#0066ff');
        this.transformer.borderStrokeWidth(2);
        // Disable dragging in rotate mode
        this.mainLayer.children.forEach(child => {
          if (this.isShape(child)) {
            child.draggable(false);
          }
        });
        break;


      case 'pencil':
        this.canSelect = false;
        this.canMove = false;
        this.canResize = false;
        this.canRotate = false;
        this.transformer.nodes([]); // remove selection
        break;


      default:
        // For drawing tools, clear selection and disable transformer
        this.transformer.nodes([]);
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
        this.transformer.borderEnabled(false);
        // Disable dragging for drawing tools
        this.mainLayer.children.forEach(child => {
          if (this.isShape(child)) {
            child.draggable(false);
          }
        });
        break;
    }

    // Handle actions
    if (['copy', 'delete', 'clear', 'undo', 'redo'].includes(tool)) {
      this.handleAction(tool);
    }

    console.log('🎨 Active tool changed to:', tool, {
      canSelect: this.canSelect,
      canMove: this.canMove,
      canResize: this.canResize,
      canRotate: this.canRotate
    });
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
    // this.subscriptions.add(
    //   this.canvasService.color$.subscribe(color => this.changeColor(color))
    // );
    this.subscriptions.add(
      this.canvasService.save$.subscribe(data => this.exportFile(data.type, data.fileName, data.path))
    );
    this.subscriptions.add(
      this.canvasService.load$.subscribe(file => this.uploadFile(file))
    );



    this.subscriptions.add(
      this.canvasService.tool$.subscribe(tool => this.onToolChange(tool))
    );


    this.subscriptions.add(
      this.canvasService.defaultFillColor$.subscribe(color => {
        console.log('Default fill color changed to:', color);
      })
    );

    this.subscriptions.add(
      this.canvasService.defaultStrokeColor$.subscribe(color => {
        console.log('Default stroke color changed to:', color);
      })
    );


    ////////////////////////////////////////
    // ✨ NEW: Handle property updates from properties bar
    this.subscriptions.add(
      this.canvasService.action$.subscribe(action => {
        if (action.startsWith('update-')) {
          this.handlePropertyUpdate(action);
        } else {
          this.handleAction(action);
        }
      })
    );
    /////////////////////////////////////////////////////////////
  }

  // ✨ NEW: Handle property updates from properties bar
  private handlePropertyUpdate(action: string): void {
    const parts = action.split(':');
    const updateType = parts[0];
    const shapeId = parts[1];

    if (!shapeId) return;

    const shape = this.mainLayer.findOne(`#${shapeId}`) as Konva.Shape;
    if (!shape || !this.isShape(shape)) return;

    switch (updateType) {
      case 'update-fill':
        const fillColor = parts[2];
        shape.fill(fillColor);
        this.mainLayer.batchDraw();
        this.updateShapePositionInBackend(shape);
        break;

      case 'update-stroke':
        const strokeColor = parts[2];
        const strokeWidth = parseFloat(parts[3]);
        shape.stroke(strokeColor);
        shape.strokeWidth(strokeWidth);
        this.mainLayer.batchDraw();
        this.updateShapePositionInBackend(shape);
        break;

      case 'update-size':
        const width = parseFloat(parts[2]);
        const height = parseFloat(parts[3]);
        this.updateShapeSize(shape, width, height);
        break;

      case 'update-position':
        const x = parseFloat(parts[2]);
        const y = parseFloat(parts[3]);
        shape.x(x);
        shape.y(y);
        this.mainLayer.batchDraw();
        this.updateShapePositionInBackend(shape);
        break;
    }
  }

  // Helper to update shape size
  private updateShapeSize(shape: Konva.Shape, width: number, height: number): void {
    if (shape instanceof Konva.Rect) {
      shape.width(width);
      shape.height(height);
    } else if (shape instanceof Konva.Circle) {
      const radius = width / 2;
      shape.radius(radius);
    } else if (shape instanceof Konva.Ellipse) {
      shape.radiusX(width / 2);
      shape.radiusY(height / 2);
    }

    this.mainLayer.batchDraw();
    this.updateShapePositionInBackend(shape);
  }

  private createPencil(x: number, y: number): Konva.Line {
    const pencil = new Konva.Line({
      points: [x, y, x, y],         // start stroke at mouse position
      stroke: this.canvasService.getDefaultStrokeColor(),
      strokeWidth: 2,
      lineCap: 'round',
      lineJoin: 'round',
      draggable: false,
      listening: true,
      tension: 0,
      shapeType: 'pencil'
    });

    // When done drawing → send to backend
    pencil.on("mouseup touchend", () => {
      this.updatePencilInBackend(pencil);
    });

    this.mainLayer.add(pencil);
    this.mainLayer.batchDraw();
    return pencil;
  }

  private updatePencilInBackend(pencil: Konva.Line): void {
    const points = pencil.points();
    const strokeColor = pencil.stroke() || '#000000';
    const strokeWidth = pencil.strokeWidth() || 2;

    const updateData = {
      id: pencil.id(),
      type: 'pencil',
      points: points,
      strokeColor: strokeColor,
      strokeWidth: strokeWidth
    };

    this.http.put(`${this.BACKEND_URL}/updateShape`, updateData).subscribe({
      next: (r) => console.log("✅ Pencil updated:", r),
      error: (e) => console.error("❌ Cannot update pencil:", e)
    });
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
          const shid = activeObject.attrs.id;
          if (shapeData) {
            this.http.post(`${this.BACKEND_URL}/copy/${shid}`, shapeData).subscribe({
              next: (copiedShapeData: any) => {
                // Create new shape using the recreateShape method
                const newShape = this.recreateShape(copiedShapeData);
                if (newShape) {
                  this.mainLayer.add(newShape);
                  this.transformer.nodes([newShape]);
                  this.mainLayer.batchDraw();
                  console.log(`✅ Copied shape with ID: ${copiedShapeData.id}`);
                } else {
                  console.error('Failed to create copied shape');
                }
              },
              error: (err) => console.error('Copy failed', err)
            });
          }
        }
        break;
      case 'delete':
        if (activeObject) {

          this.saveStateToBackend('delete');
        }
        break;

      case 'clear':
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


  private saveStateToBackend(actionType: string): void {
    if (!this.stage) return;

    const selectedNodes = this.transformer.nodes();
    const activeObject = selectedNodes.length > 0 ? selectedNodes[0] : null;
    const cur = activeObject?.attrs.id;

    if (actionType === 'delete') {
      if (activeObject && cur) {
        activeObject.destroy();
        this.transformer.nodes([]);

        // ✨ FIX: Use proper HttpClient.delete() syntax
        this.http.delete(`${this.BACKEND_URL}/${actionType}/${cur}`).subscribe({
          next: () => console.log(`Shape deleted from backend: ${cur}`),
          error: (err) => console.error('Error deleting shape', err)
        });
      }
    }
    else if (actionType === 'clear') {
      this.mainLayer.destroyChildren();
      this.mainLayer.add(this.transformer);
      this.transformer.nodes([]);

      // ✨ FIX: Use proper HttpClient.delete() syntax
      this.http.delete(`${this.BACKEND_URL}/delete`).subscribe({
        next: () => console.log(`Shape deleted from backend`),
        error: (err) => console.error('Error deleting shape', err)
      });
    }
  }
private performUndo(): void {
  this.http.post(`${this.BACKEND_URL}/undo`, {}).subscribe({
    next: (response: any) => {
      // Check if response contains an error
      if (response.error) {
        alert(response.error); // Show alert with the error message
        return;
      }
      
      if (response) {
        this.handleUndoRedoResponse(response);
      }
    },
    error: (err) => {
      console.error('Undo failed', err);
      // Handle HTTP errors (500, 404, etc.)
      if (err.error?.error) {
        alert(err.error.error);
      } else {
        alert('Failed to perform undo operation');
      }
    }
  });
}

private performRedo(): void {
  this.http.post(`${this.BACKEND_URL}/redo`, {}).subscribe({
    next: (response: any) => {
      // Check if response contains an error
      if (response.error) {
        alert(response.error); // Show alert with the error message
        return;
      }
      
      if (response) {
        this.handleUndoRedoResponse(response);
      }
    },
    error: (err) => {
      console.error('Redo failed', err);
      // Handle HTTP errors (500, 404, etc.)
      if (err.error?.error) {
        alert(err.error.error);
      } else {
        alert('Failed to perform redo operation');
      }
    }
  });
}

  private handleUndoRedoResponse(shapeData: any): void {
    const action = shapeData.action; // Get action from response
    const shapeId = shapeData.id;
    console.log('Processing shape:', shapeId, 'with action:', action);

    if (action === 'remove') {
      // Remove shape from canvas
      const existingShape = this.mainLayer.findOne((node: Konva.Node) => node.id() === shapeId);

      console.log('Found shape to remove:', existingShape);

      if (existingShape) {
        existingShape.destroy();
        console.log(`🗑️ Deleted shape with ID: ${shapeId}`);
      } else {
        console.log(`❌ Shape not found with ID: ${shapeId}`);
        // Debug: print all shapes in layer
        console.log('All shapes in layer:', this.mainLayer.children?.map((c: Konva.Node) => c.id()));
      }
    }
    else if (action === 'add') {
      // Check if shape already exists
      const existingShape = this.mainLayer.findOne((node: Konva.Node) => node.id() === shapeId);

      if (existingShape) {
        // Update existing shape
        this.updateExistingShape(existingShape as Konva.Shape, shapeData);
        console.log(`🔄 Updated existing shape with ID: ${shapeId}`);
      } else {
        // Create new shape
        const newShape = this.recreateShape(shapeData);
        if (newShape) {
          this.mainLayer.add(newShape);
          console.log(`✅ Loaded new shape with ID: ${shapeId}`);
        }
      }
    }
    else if (action === 'update') {
      // Update existing shape with new properties
      const existingShape = this.mainLayer.findOne((node: Konva.Node) => node.id() === shapeId);

      if (existingShape) {
        this.updateExistingShape(existingShape as Konva.Shape, shapeData);
        console.log(`🔄 Updated shape properties with ID: ${shapeId}`);
      } else {
        console.log(`❌ Shape not found for update with ID: ${shapeId}`);
        console.log('All shapes in layer:', this.mainLayer.children?.map((c: Konva.Node) => c.id()));
      }
    }

    // Clear selection and redraw
    this.transformer.nodes([]);
    this.mainLayer.batchDraw();
  }

  private updateExistingShape(shape: Konva.Shape, data: any): void {
    // Update common properties
    shape.fill(data.fillColor);
    shape.stroke(data.outlineColor);
    shape.strokeWidth(data.strokeWidth);
    shape.rotation(data.angle || 0);

    // Handle TEXT
    if (data.type === 'text' && shape instanceof Konva.Text) {
      shape.text(data.properties?.content || "Text");
      shape.fontSize(data.properties?.fontSize || 28);
      shape.fontFamily(data.properties?.fontFamily || 'Arial');
      shape.fontStyle(data.properties?.fontStyle || 'normal');
      shape.x(data.x);
      shape.y(data.y);
      return; // Exit here
    }

    // Handle PENCIL
    if (data.type === 'pencil' && shape instanceof Konva.Line) {
      shape.points(data.points);
      shape.stroke(data.strokeColor);
      shape.strokeWidth(data.strokeWidth);
      return;
    }

    // Handle RECTANGLE/SQUARE
    if (shape instanceof Konva.Rect) {
      shape.x(data.x);
      shape.y(data.y);
      if (data.type === 'square') {
        shape.width(data.properties.sideLength);
        shape.height(data.properties.sideLength);
      } else {
        shape.width(data.properties.width);
        shape.height(data.properties.length);
      }
    }

    // Handle CIRCLE
    else if (shape instanceof Konva.Circle) {
      shape.radius(data.properties.radius);
      shape.x(data.centerX);
      shape.y(data.centerY);
    }

    // Handle ELLIPSE
    else if (shape instanceof Konva.Ellipse) {
      shape.radiusX(data.properties.radiusX);
      shape.radiusY(data.properties.radiusY);
      shape.x(data.centerX);
      shape.y(data.centerY);
    }

    // Handle TRIANGLE
    else if (shape instanceof Konva.RegularPolygon) {
      shape.radius(data.properties.height || data.properties.base);
      shape.x(data.centerX);
      shape.y(data.centerY);
    }

    // Handle LINE
    else if (shape instanceof Konva.Line) {
      const pts = [
        data.x,
        data.y,
        data.properties.xEnd,
        data.properties.yEnd
      ];
      shape.points(pts);
    }
  }


  private recreateShape(s: any): Konva.Shape | null {

    if (!s || !s.type) return null;

    let shape: Konva.Shape | null = null;

    //
    // 1️⃣ TEXT (special case)
    //
    if (s.type === 'text') {
      shape = new Konva.Text({
        x: s.x || 0,
        y: s.y || 0,
        text: s.properties?.content || "Text",
        fontSize: s.properties?.fontSize || 28,
        fontFamily: s.properties?.fontFamily || 'Arial',
        fontStyle: s.properties?.fontStyle || 'normal',
        fill: s.fillColor || '#ffffff',
        stroke: s.outlineColor || '#090101',
        strokeWidth: s.strokeWidth || 2,
        rotation: s.angle || 0,
        draggable: true,
        padding: 4
      });

      shape.id(s.id);

      // Re-attach event listeners
      shape.on("dragend", () => {
        this.updateShapePositionInBackend(shape as Konva.Text);
      });

      shape.on("transformend", () => {
        this.updateShapePositionInBackend(shape as Konva.Text);
      });

      shape.on("dblclick dbltap", () => {
        this.startEditingText(shape as Konva.Text);
      });

      return shape;
    }

    //
    // 2️⃣ PENCIL
    //
    if (s.type === 'pencil') {
      // create starting point
      shape = this.createPencil(s.points[0], s.points[1]);

      // replace ALL points from backend
      (shape as Konva.Line).points(s.points);

      shape.stroke(s.strokeColor);
      shape.strokeWidth(s.strokeWidth);
      shape.id(s.id);
      return shape;
    }

    //
    // 3️⃣ NORMAL SHAPES (rect, square, circle, ellipse, triangle, line)
    //
    // For shapes with centerX/centerY, use those coordinates
    const useCenter = s.type === 'circle' || s.type === 'ellipse' || s.type === 'triangle';
    const shapeX = useCenter ? (s.centerX ?? s.x ?? 0) : (s.x ?? 0);
    const shapeY = useCenter ? (s.centerY ?? s.y ?? 0) : (s.y ?? 0);

    shape = this.createShape(s.type === "rectangle" ? "rect" : s.type, shapeX, shapeY);
    if (!shape) return null;

    shape.id(s.id);
    shape.fill(s.fillColor || '#000000');
    shape.stroke(s.outlineColor || '#000000');
    shape.strokeWidth(s.strokeWidth || 1);
    shape.rotation(s.angle || 0);

    // Apply sizes
    if (shape instanceof Konva.Rect) {
      if (s.type === "square") {
        const sideLength = s.properties?.sideLength ?? 50;
        shape.width(sideLength);
        shape.height(sideLength);
        shape.setAttr("shapeType", "square");
      } else {
        const width = s.properties?.width ?? 100;
        const height = s.properties?.length ?? s.properties?.height ?? 50;
        shape.width(width);
        shape.height(height);
        shape.setAttr("shapeType", "rectangle");
      }
    }

    else if (shape instanceof Konva.Circle) {
      const radius = s.properties?.radius ?? 50;
      shape.radius(radius);
    }

    else if (shape instanceof Konva.Ellipse) {
      const rx = s.properties?.radiusX ?? (s.properties?.width ? s.properties.width / 2 : 50);
      const ry = s.properties?.radiusY ?? (s.properties?.height ? s.properties.height / 2 : 30);
      shape.radiusX(rx);
      shape.radiusY(ry);
    }

    else if (shape instanceof Konva.RegularPolygon) {
      const radius = s.properties?.height ? s.properties.height / 1.5 : s.properties?.radius ?? 50;
      shape.radius(radius);
    }

    else if (shape instanceof Konva.Line) {
      const pts = [
        s.x ?? 0,
        s.y ?? 0,
        s.properties?.xEnd ?? (s.x ?? 0) + 100,
        s.properties?.yEnd ?? (s.y ?? 0) + 100
      ];
      shape.points(pts);
    }

    return shape;
  }








  private loadShapesListState(state: any[]): void {
    // 1. Clear layer
    this.mainLayer.destroyChildren();
    this.mainLayer.add(this.transformer);

    // 2. Create each shape again
    for (const s of state) {
      const shape = this.recreateShape(s);
      if (shape) this.mainLayer.add(shape);
    }

    // 3. Redraw
    this.mainLayer.draw();
    this.transformer.nodes([]);
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

    // ✨ IMPORTANT: Recreate transformer (not just reference it)
    this.transformer = new Konva.Transformer();
    this.mainLayer.add(this.transformer);

    this.initKonvaEvents();
    this.drawGrid();

    console.log('✅ Canvas state loaded successfully');
  }
  // ✨ NEW: Load shapes from JSON file (array of shape objects)
  private loadShapesFromFile(shapesData: any[]): void {
    if (!Array.isArray(shapesData)) {
      console.error('Invalid JSON format. Expected an array of shapes.');
      return;
    }

    if (!this.transformer) {
      console.warn('⚠️ Transformer not found, recreating...');
      this.transformer = new Konva.Transformer();
    }

    // Clear existing shapes (keep transformer and background)
    this.mainLayer.destroyChildren();
    this.mainLayer.add(this.transformer);

    // Load each shape
    shapesData.forEach(shapeData => {
      const shape = this.recreateShape(shapeData);
      if (shape) {
        this.mainLayer.add(shape);
        console.log(`✅ Loaded shape ID: ${shapeData.id}`);
      }
    });

    // Redraw and clear selection
    this.transformer.nodes([]);
    this.mainLayer.batchDraw();
    console.log(`✅ Loaded ${shapesData.length} shapes from file`);
  }

  private exportFile(type: string, fileName: string, path?: string): void {
    if (!this.stage) return;

    // Get all shapes from the main layer
    const shapes = this.mainLayer.children.filter(child =>
      this.isShape(child) && child.id() !== 'board-background'
    );

    // Format each shape's data
    const shapesData = shapes.map(shape => {
      const shapeData = this.formatShapeData(shape);
      return {
        ...shapeData,
        id: shape.id() || shape._id.toString()
      };
    });

    // Create the payload
    const payload = {
      fileName: fileName,
      filePath: path || ''

    };

    // Determine the endpoint based on type
    const endpoint = type === 'json'
      ? `${this.BACKEND_URL}/save/json`
      : `${this.BACKEND_URL}/save/xml`;

    console.log(`💾 Saving as ${type.toUpperCase()}:`, payload);

    this.http.post(endpoint, payload).subscribe({
      next: (response) => {
        console.log('✅ File saved successfully:', response);
        alert(`File saved successfully as ${type.toUpperCase()}!`);
      },
      error: (err) => {
        console.error('❌ Error saving file:', err);
        alert(`Failed to save file: ${err.message || 'Unknown error'}`);
      }
    });
  }

  private uploadFile(file: File): void {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;

        // Try to parse as JSON
        const parsedData = JSON.parse(content);

        // Check if it's an array of shapes (from your JSON file format)
        if (Array.isArray(parsedData)) {
          console.log('📂 Detected shape array format');
          this.loadShapesFromFile(parsedData);
        }
        // Otherwise, treat as Konva stage JSON
        else if (parsedData && typeof parsedData === 'object') {
          console.log('📂 Detected Konva stage format');
          this.loadCanvasState(content);
          // ✨ IMPORTANT: Reinitialize events after loading canvas state
          this.initKonvaEvents();
        }
        else {
          throw new Error('Invalid JSON format');
        }

        // ✨ NEW: Ensure transformer is ready
        if (!this.transformer) {
          this.transformer = new Konva.Transformer();
          this.mainLayer.add(this.transformer);
        }

        // Notify backend
        // this.saveStateToBackend('file_loaded');  // Optional: comment out if causing issues

      } catch (error) {
        console.error('❌ Failed to load file:', error);
        alert('Failed to load file. Please check the format.');
      }
    };
    reader.onerror = () => {
      console.error('❌ Error reading file');
      alert('Error reading file');
    };

    reader.readAsText(file);
  }

  private updateUndoRedoLock(): void {
    this.http.get(`${this.BACKEND_URL}/historyStatus`).subscribe({
      next: (st: any) => {
        this.undoAvailable = st.undo;
        this.redoAvailable = st.redo;
      },
      error: () => {
        this.undoAvailable = false;
        this.redoAvailable = false;
      }
    });
  }


}
