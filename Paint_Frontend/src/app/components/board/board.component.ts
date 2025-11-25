













// src/app/components/board/board.component.ts
import {
  Component,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  HostListener
} from '@angular/core';
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

  // NOTE: the template should have: <div #canvas id="board-container" class="board-container"></div>
  @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLDivElement>;

  stage!: Konva.Stage;
  mainLayer!: Konva.Layer;
  gridLayer!: Konva.Layer;
  transformer!: Konva.Transformer;

  private subscriptions: Subscription = new Subscription();
  private readonly BACKEND_URL = 'http://localhost:8080/api/shape';

  // logical canvas size (the white board inside the container)
  canvasWidth = 960;
  canvasHeight = 720;
  backgroundColor = '#ffffff';

  // tools & drawing state
  activeTool: string = 'select'; // default tool
  isDrawing = false;
  currentShape: Konva.Shape | null = null;
  startX = 0;
  startY = 0;

  // zoom & grid
  zoom = 1;
  minZoom = 0.4;
  maxZoom = 5;
  zoomStep = 0.1;
  gridSize = 20;
  gridless = true;

  // panning
  isPanning = false;
  lastMouseX = 0;
  lastMouseY = 0;

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
    // small timeout ensures DOM ready
    setTimeout(() => {
      this.initKonva();
      this.resetPanToCenter();
      this.drawGrid();
      this.setupSubscriptions();
      this.applyToolSettings(); // enforce initial tool mode
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.stage) this.stage.destroy();
  }

  // -------------------------
  // Initialize Konva
  // -------------------------
  initKonva() {
    const container = this.getContainer();
    if (!container) {
      console.error('Board container not found!');
      return;
    }

    this.stage = new Konva.Stage({
      container: container,
      width: container.clientWidth,
      height: container.clientHeight
    });

    this.gridLayer = new Konva.Layer();
    this.mainLayer = new Konva.Layer();
    this.transformer = new Konva.Transformer({
      rotateEnabled: true
    });

    this.stage.add(this.gridLayer);
    this.stage.add(this.mainLayer);
    this.mainLayer.add(this.transformer);

    // board background rect (logical canvas)
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

  // safe getter for container
 private getContainer(): HTMLDivElement | null {
  const el = this.canvasRef?.nativeElement?.closest('.board-container');
  return el instanceof HTMLDivElement ? el : null;
}


  // -------------------------
  // Konva event wiring
  // -------------------------
  private initKonvaEvents() {
    // Click/tap: selection / eyedropper / fill behaviors
    this.stage.on('click tap', (e) => {
      // if clicked stage or background >> clear selection
      if (e.target === this.stage || e.target.id && e.target.id() === 'board-background') {
        this.transformer.nodes([]);
        this.canvasService.setSelectedShape(null);
        return;
      }

      // if clicked transformer handle -> ignore
      if (e.target.getParent()?.className === 'Transformer') {
        return;
      }

      // Eyedropper: pick fill color from clicked shape
if (this.activeTool === 'eyedropper' && e.target instanceof Konva.Shape) {

  let pickedFill = e.target.getAttr('fill');

  // Konva may return gradient objects → ignore them
  if (typeof pickedFill !== 'string') {
    pickedFill = '#000000';  // fallback
  }

<<<<<<< HEAD
  this.canvasService.changeColor(pickedFill);
  return;
}

      // Paint bucket (fill chosen color into shape)
      if (this.activeTool === 'fill' && e.target instanceof Konva.Shape) {
        const selected = e.target as Konva.Shape;
        // get last chosen color from canvasService? We'll just set to selectedShape via selectedShape$ usage by properties bar.
        // Instead, use the service's selectedShape to set color via updateFillColor method (the properties bar typically calls).
        // We'll directly set fill to currently selected color stored in service? As service doesn't store color state, we keep behavior: select and let properties fill control.
        // Here we'll just select the shape so user can use properties to change fill, or we can ask CanvasService to change fill via color$ stream if available.
        this.transformer.nodes([selected]);
        this.canvasService.setSelectedShape({
          id: selected.id(),
          type: selected.getAttr('shapeType') || selected.className,
          x: selected.x(),
          y: selected.y(),
          width: (selected as any).width ? (selected as any).width() : 0,
          height: (selected as any).height ? (selected as any).height() : 0,
          fill: selected.getAttr('fill'),
          stroke: selected.getAttr('stroke'),
          strokeWidth: selected.getAttr('strokeWidth')
        });
        return;
      }

      // selection / move / resize / rotate rules:
      if (this.activeTool === 'select') {
        if (e.target instanceof Konva.Shape) {
          this.transformer.nodes([e.target]);
          this.canvasService.setSelectedShape({
            id: e.target.id(),
            type: e.target.getAttr('shapeType') || e.target.className,
            x: e.target.x(),
            y: e.target.y(),
            width: (typeof (e.target as any).width === 'function') ? (e.target as any).width() : 0,
            height: (typeof (e.target as any).height === 'function') ? (e.target as any).height() : 0,
            fill: e.target.getAttr('fill'),
            stroke: e.target.getAttr('stroke'),
            strokeWidth: e.target.getAttr('strokeWidth'),
          });
        } else {
          this.transformer.nodes([]);
          this.canvasService.setSelectedShape(null);
        }
        return;
      }

      // 'move' tool: clicking a shape selects it and enables dragging for that shape only
      if (this.activeTool === 'move') {
        if (e.target instanceof Konva.Shape) {
          const shape = e.target as Konva.Shape;
          // clear transformer (we don't want resize anchors in move mode)
          this.transformer.nodes([]);
          // set only this shape draggable, others not
          this.mainLayer.getChildren().forEach((child) => {
            if (this.isShape(child)) {
              (child as Konva.Shape).draggable(child === shape);
            }
          });
          // ensure selected shape is known to Properties
          this.canvasService.setSelectedShape({
            id: shape.id(),
            type: shape.getAttr('shapeType') || shape.className,
            x: shape.x(),
            y: shape.y(),
            width: (shape as any).width ? (shape as any).width() : 0,
            height: (shape as any).height ? (shape as any).height() : 0,
            fill: shape.getAttr('fill'),
            stroke: shape.getAttr('stroke'),
            strokeWidth: shape.getAttr('strokeWidth'),
          });
        } else {
          // clicked empty space -> disable dragging on all shapes
          this.mainLayer.getChildren().forEach((child) => {
            if (this.isShape(child)) (child as Konva.Shape).draggable(false);
          });
          this.canvasService.setSelectedShape(null);
        }
        return;
=======
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
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
      }

      // For 'resize' or 'rotate' we will not start new selection here; user should be in select tool to use transformer.
      // For drawing tools, clicks are handled by mousedown/mouseup events.
    });

    // start drawing
    this.stage.on('mousedown touchstart', (e) => {
      if (this.isPanning) return;

      // drawing only allowed for actual drawing tools (not select/move/resize/rotate)
      if (['select', 'move', 'resize', 'rotate'].includes(this.activeTool)) {
        return;
      }

      const pos = this.stage.getPointerPosition();
      if (!pos) return;
      const canvasPos = this.getCanvasPosition(pos.x, pos.y);

      this.isDrawing = true;
      this.startX = canvasPos.x;
      this.startY = canvasPos.y;

      // create initial shape depending on tool
      this.currentShape = this.createShape(this.activeTool, canvasPos.x, canvasPos.y);
      if (!this.currentShape) {
        this.isDrawing = false;
        return;
      }

      // when drawing lines/freehand we want listening enabled and draggable false
      this.currentShape.draggable(false);
      this.mainLayer.add(this.currentShape);
    });

    // during drawing
    this.stage.on('mousemove touchmove', (e) => {
      const pointer = this.stage.getPointerPosition();
      if (pointer) {
        const canvasPos = this.getCanvasPosition(pointer.x, pointer.y);
        this.canvasService.setMousePosition(canvasPos.x, canvasPos.y);
      }

      if (!this.isDrawing || !this.currentShape) return;

      const p = this.stage.getPointerPosition();
      if (!p) return;
      const canvasPos = this.getCanvasPosition(p.x, p.y);
      this.updateShape(this.currentShape, this.startX, this.startY, canvasPos.x, canvasPos.y);
    });

    // finish drawing
    this.stage.on('mouseup touchend', () => {
      if (!this.isDrawing || !this.currentShape) return;
      this.isDrawing = false;

      // if the shape is too small — remove it (avoid accidental dots)
      if (this.isShapeTooSmall(this.currentShape)) {
        this.currentShape.destroy();
        this.mainLayer.batchDraw();
        this.currentShape = null;
        return;
      }

      // send to backend and set selection according to tool rules
      this.sendShapeToBackend(this.currentShape);

      // After creation: if user wants to immediately move/transform, they should switch to select/move tool.
      // Default: created shapes remain non-draggable until 'select' or 'move' tool is applied.
      this.currentShape.draggable(false);
      this.transformer.nodes([]);
      this.currentShape = null;
    });

    // dragend (movement)
    this.stage.on('dragend', (e) => {
      const target = e.target;
      if (this.isShape(target) && this.activeTool === 'move') {
        this.updateShapePositionInBackend(target as Konva.Shape);
      } else if (this.isShape(target) && this.activeTool === 'select') {
        // if user dragged while in select (we allow draggable in select), update backend too
        this.updateShapePositionInBackend(target as Konva.Shape);
      }
    });

<<<<<<< HEAD
    // transformend (resize/rotate)
    this.stage.on('transformend', () => {
      const nodes = this.transformer.nodes();
      nodes.forEach((node) => {
=======
    // âœ… FIXED: Transformend - works for both resize AND rotate
    this.transformer.on('transformend', (e) => {
      // ⚠️ IMPORTANT: e.target is the Transformer, not the shape!
      // We need to get the actual transformed shapes from transformer.nodes()
      const transformedShapes = this.transformer.nodes();


      // Update each transformed shape
      transformedShapes.forEach(node => {
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
        if (this.isShape(node)) {
          this.updateShapePositionInBackend(node as Konva.Shape);
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

<<<<<<< HEAD
  // -------------------------
  // Helpers
  // -------------------------
=======

 /////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // ✨ NEW: Notify service when shape is selected
  private notifyShapeSelection(shape: Konva.Shape | null): void {
    if (!shape) {
      this.canvasService.selectShape(null);
      return;
    }

    const shapeData = {
      id: shape.getAttr('id') || shape._id.toString(),
      type: this.getShapeType(shape),
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
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
  private isShape(node: Konva.Node): node is Konva.Shape {
    return node instanceof Konva.Shape && node.id() !== 'board-background';
  }

  private isShapeTooSmall(shape: Konva.Shape): boolean {
    const w = (shape as any).width ? (shape as any).width() : 0;
    const h = (shape as any).height ? (shape as any).height() : 0;
    const r = (shape as any).radius ? (shape as any).radius() : 0;
    if ((w && h && (w < 6 || h < 6)) || (r && r < 3)) return true;
    return false;
  }

  // Convert stage pointer to logical canvas coords (accounting for stage position and scale)
  private getCanvasPosition(stageX: number, stageY: number) {
    const pos = this.stage.position();
    const scale = this.stage.scaleX();
    return {
      x: (stageX - pos.x) / scale,
      y: (stageY - pos.y) / scale
    };
  }

  // -------------------------
  // Shape creation
  // -------------------------
  private createShape(tool: string, x: number, y: number): Konva.Shape | null {
<<<<<<< HEAD
    const base: any = {
      x,
      y,
      fill: '#ffffff',
      stroke: '#090101',
=======
    // الإعدادات الافتراضية لكل الأشكال
    const defaultConfig = {
      x: x,
      y: y,
      fill: this.canvasService.getDefaultFillColor(),      // لون التعبئة (ابيض)
      stroke: this.canvasService.getDefaultStrokeColor(),    // لون الحدود (أسود)
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
      strokeWidth: 2,
      draggable: false,
      listening: true
    };

    switch (tool) {
      case 'rect':
        return new Konva.Rect({ ...base, width: 0, height: 0, shapeType: 'rectangle' });
      case 'square':
        return new Konva.Rect({ ...base, width: 0, height: 0, shapeType: 'square' });
      case 'circle':
        // we will set radius in updateShape; keep center at x,y initially
        return new Konva.Circle({ ...base, radius: 0, shapeType: 'circle' });
      case 'ellipse':
        return new Konva.Ellipse({ ...base, radiusX: 0, radiusY: 0, listening: true, shapeType: 'ellipse' });
      case 'triangle':
        // Regular triangle (equilateral)
        return new Konva.RegularPolygon({ ...base, sides: 3, radius: 0, shapeType: 'triangle' });
      case 'line':
        return new Konva.Line({ ...base, points: [x, y, x, y], strokeWidth: 3, lineCap: 'round', lineJoin: 'round', shapeType: 'line', fill: undefined });
      case 'pencil':
      case 'freehand':
        // Freehand/pencil: start a line with points
        return new Konva.Line({ ...base, points: [x, y], strokeWidth: 2, lineCap: 'round', lineJoin: 'round', tension: 0.5, shapeType: 'freehand', fill: undefined });
      default:
        return null;
    }
  }

  // Update shape while drawing
  private updateShape(shape: Konva.Shape, sx: number, sy: number, ex: number, ey: number) {
    const w = ex - sx;
    const h = ey - sy;

    if (shape instanceof Konva.Rect) {
      if (shape.getAttr('shapeType') === 'square') {
        const size = Math.min(Math.abs(w), Math.abs(h));
        shape.width(w >= 0 ? size : -size);
        shape.height(h >= 0 ? size : -size);
        // set a consistent top-left when negative
        if (w < 0) shape.x(sx + w);
        if (h < 0) shape.y(sy + h);
      } else {
        shape.width(Math.abs(w));
        shape.height(Math.abs(h));
        shape.x(w >= 0 ? sx : ex);
        shape.y(h >= 0 ? sy : ey);
      }
    } else if (shape instanceof Konva.Circle) {
      // radius as half of diagonal
      const radius = Math.sqrt(w * w + h * h) / 2;
      shape.radius(radius);
      // center at midpoint
      shape.x(sx + w / 2);
      shape.y(sy + h / 2);
    } else if (shape instanceof Konva.Ellipse) {
      shape.radiusX(Math.abs(w) / 2);
      shape.radiusY(Math.abs(h) / 2);
      shape.x(sx + w / 2);
      shape.y(sy + h / 2);
    } else if (shape instanceof Konva.RegularPolygon) {
      // triangle: radius from center, set center to midpoint
      const radius = Math.sqrt(w * w + h * h) / 2;
      shape.radius(radius);
      shape.x(sx + w / 2);
      shape.y(sy + h / 2);
    } else if (shape instanceof Konva.Line) {
      const type = shape.getAttr('shapeType');
      if (type === 'freehand') {
        // append points for freehand line
        const pts = (shape.points() as number[]).slice();
        pts.push(ex, ey);
        shape.points(pts);
      } else {
        // normal line between two points
        shape.points([sx, sy, ex, ey]);
      }
    }

    this.mainLayer.batchDraw();
  }

<<<<<<< HEAD
  // -------------------------
  // Backend: send / update shapes
  // -------------------------
  private sendShapeToBackend(shape: Konva.Shape) {
    const data = this.formatShapeData(shape);
    if (!data) return;
    this.http.post(this.BACKEND_URL, data).subscribe({
      next: (res: any) => {
        if (res?.id) {
          shape.setAttr('id', res.id);
=======
// ✨ NEW: Send shape data to backend (إرسال بيانات الشكل للـ backend)
  private sendShapeToBackend(shape: Konva.Shape): void {
    const shapeData = this.formatShapeData(shape);

    this.http.post(`${this.BACKEND_URL}`, shapeData).subscribe({
      next: (response) => {
        console.log('Shape saved successfully:', response);
        if (response && (response as any).id) {
          const shapeId = (response as any).id.toString();
          shape.id(shapeId); // ✅ Just set Konva's ID
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
        }
      },
      error: (err) => {
        console.error('Failed to save shape', err);
      }
    });
  }

  private formatShapeData(shape: Konva.Shape) {
    if (!this.isShape(shape)) return null;
    const type = shape.getAttr('shapeType') || shape.className;
    const fillColor = shape.getAttr('fill') ?? null;
    const outlineColor = shape.getAttr('stroke') ?? null;
    const strokeWidth = shape.getAttr('strokeWidth') ?? 0;
    const x = shape.x();
    const y = shape.y();
    const width = (shape as any).width ? (shape as any).width() : 0;
    const height = (shape as any).height ? (shape as any).height() : 0;
    const angle = shape.rotation ? shape.rotation() : 0;

    return {
      type,
      fillColor,
      outlineColor,
      strokeWidth,
      x,
      y,
      width,
      height,
      angle
    };
  }

  private updateShapePositionInBackend(shape: Konva.Shape) {
    const id = shape.getAttr('id');
    if (!id) return;

    const updateData = {
<<<<<<< HEAD
      id,
      x: shape.x(),
      y: shape.y(),
      centerX: shape.x() + ((shape as any).width ? (shape as any).width() / 2 : 0),
      centerY: shape.y() + ((shape as any).height ? (shape as any).height() / 2 : 0),
      angle: shape.rotation ? shape.rotation() : 0,
      properties: {
        width: (shape as any).width ? (shape as any).width() : 0,
        height: (shape as any).height ? (shape as any).height() : 0
      }
=======
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
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
    };

    this.http.put(`${this.BACKEND_URL}/updateShape`, updateData).subscribe({
      next: () => {},
      error: (err) => console.error('Failed to update shape', err)
    });
  }

  // -------------------------
  // Subscriptions from CanvasService (properties, tool, etc.)
  // -------------------------
  private setupSubscriptions(): void {
    // shape fill change
    this.subscriptions.add(
      this.canvasService.shapeFillChange$.subscribe((data: any) => {
        const { shapeId, color } = data;
        const shape = this.mainLayer.findOne(`#${shapeId}`) as Konva.Shape;
        if (shape) {
          shape.fill(color);
          this.mainLayer.batchDraw();
        }
      })
    );

    // stroke + width change
    this.subscriptions.add(
      this.canvasService.shapeStrokeChange$.subscribe((data: any) => {
        const { shapeId, stroke, width } = data;
        const shape = this.mainLayer.findOne(`#${shapeId}`) as Konva.Shape;
        if (shape) {
          shape.stroke(stroke);
          shape.strokeWidth(width);
          this.mainLayer.batchDraw();
        }
      })
    );

    // size change
    this.subscriptions.add(
      this.canvasService.shapeSizeChange$.subscribe((data: any) => {
        const { shapeId, width, height } = data;
        const shape = this.mainLayer.findOne(`#${shapeId}`) as Konva.Shape;
        if (shape && (shape as any).width && (shape as any).height) {
          (shape as any).width(width);
          (shape as any).height(height);
          this.mainLayer.batchDraw();
        }
      })
    );

    // position change
    this.subscriptions.add(
      this.canvasService.shapePositionChange$.subscribe((data: any) => {
        const { shapeId, x, y } = data;
        const shape = this.mainLayer.findOne(`#${shapeId}`) as Konva.Shape;
        if (shape) {
          shape.x(x);
          shape.y(y);
          this.mainLayer.batchDraw();
        }
      })
    );

    // tool change from toolbar
    this.subscriptions.add(
      this.canvasService.tool$.subscribe((tool: any) => {
        this.onToolChange(tool);
      })
    );
  }

  // -------------------------
  // Tool change logic (strict rules)
  // -------------------------
  onToolChange(tool: string) {
    this.activeTool = tool;
    this.applyToolSettings();
  }

  private applyToolSettings() {
    if (!this.mainLayer || !this.transformer) return;

    switch (this.activeTool) {
      case 'select':
        // allow full transformations and dragging
        this.transformer.enabledAnchors([
          'top-left', 'top-center', 'top-right',
          'middle-right', 'middle-left',
          'bottom-left', 'bottom-center', 'bottom-right'
        ]);
        this.transformer.rotateEnabled(true);
        // enable draggable on shapes so user can drag when selected
        this.mainLayer.getChildren().forEach((child) => {
          if (this.isShape(child)) (child as Konva.Shape).draggable(true);
        });
        break;

      case 'move':
        // hide transformer and enable dragging but only when user selects a shape
        this.transformer.nodes([]);
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
        // by default disable global dragging for shapes; clicking a shape will enable dragging for only that shape
        this.mainLayer.getChildren().forEach((child) => {
          if (this.isShape(child)) (child as Konva.Shape).draggable(false);
        });
        break;

      case 'resize':
        // allow only resizing (no rotation, no dragging)
        this.transformer.enabledAnchors([
          'top-left', 'top-center', 'top-right',
          'middle-right', 'middle-left',
          'bottom-left', 'bottom-center', 'bottom-right'
        ]);
        this.transformer.rotateEnabled(false);
        this.mainLayer.getChildren().forEach((child) => {
          if (this.isShape(child)) (child as Konva.Shape).draggable(false);
        });
        break;

      case 'rotate':
        // allow only rotation (no resize anchors)
        this.transformer.nodes([]);
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(true);
        this.mainLayer.getChildren().forEach((child) => {
          if (this.isShape(child)) (child as Konva.Shape).draggable(false);
        });
        break;

      default:
        // any drawing tool: disable transformer and disable dragging for shapes
        this.transformer.nodes([]);
        this.transformer.enabledAnchors([]);
        this.transformer.rotateEnabled(false);
        this.mainLayer.getChildren().forEach((child) => {
          if (this.isShape(child)) (child as Konva.Shape).draggable(false);
        });
        break;
    }
  }

  // -------------------------
  // Resize / Zoom / Pan / Grid
  // -------------------------
  @HostListener('wheel', ['$event'])
  onWheel(e: WheelEvent) {
    if (!this.stage) return;
    e.preventDefault();
    e.stopPropagation();

    const dir = e.deltaY > 0 ? -1 : 1;
    const rawNewZoom = this.zoom + dir * this.zoomStep;
    const newZoom = Math.max(this.minZoom, Math.min(rawNewZoom, this.maxZoom));

    const scaledGridPx = this.gridSize * newZoom;
    if (scaledGridPx < 8) return;

    const pointer = this.stage.getPointerPosition();
    if (!pointer) {
      this.smoothZoomTo(newZoom);
      return;
    }

    this.setZoomKonvaInstant(newZoom, pointer.x, pointer.y);
  }

  setZoomKonvaInstant(newZoom: number, pointerX: number, pointerY: number) {
    if (!this.stage) return;

    const oldZoom = this.stage.scaleX();
    const oldPos = this.stage.position();

    const mousePointTo = {
      x: (pointerX - oldPos.x) / oldZoom,
      y: (pointerY - oldPos.y) / oldZoom
    };

    const newPos = {
      x: pointerX - mousePointTo.x * newZoom,
      y: pointerY - mousePointTo.y * newZoom
    };

    this.stage.scale({ x: newZoom, y: newZoom });
    this.stage.position(newPos);

    this.zoom = newZoom;
    this.clampPan();
    this.drawGrid();
  }

  smoothZoomTo(targetZoom: number, clientX?: number | null, clientY?: number | null) {
    // animate zooming (fallback when mouse pointer missing)
    if (!this.stage) return;
    targetZoom = Math.max(this.minZoom, Math.min(targetZoom, this.maxZoom));

    const startZoom = this.zoom;
    const diff = targetZoom - startZoom;
    const steps = 12;
    let step = 0;

    const container = this.getContainer();
    if (!container) return;
    const pivotX = (clientX === null || clientX === undefined) ? container.clientWidth / 2 : clientX!;
    const pivotY = (clientY === null || clientY === undefined) ? container.clientHeight / 2 : clientY!;

    const animate = () => {
      step++;
      const t = step / steps;
      const eased = t * t * (3 - 2 * t);
      const z = startZoom + diff * eased;
      this.setZoomKonvaInstant(z, pivotX, pivotY);
      if (step < steps) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
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

  private animateToView(targetZoom: number, targetX: number, targetY: number) {
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
      const eased = t * t * (3 - 2 * t);

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

  private fitToScreen() {
    if (!this.stage) return;
    const containerW = this.stage.width();
    const containerH = this.stage.height();
    let newZoom = Math.min(containerW / this.canvasWidth, containerH / this.canvasHeight);
    newZoom = newZoom * 0.9;
    newZoom = Math.max(this.minZoom, Math.min(newZoom, this.maxZoom));
    const targetX = (containerW - this.canvasWidth * newZoom) / 2;
    const targetY = (containerH - this.canvasHeight * newZoom) / 2;
    this.animateToView(newZoom, targetX, targetY);
  }

  clampPan() {
    const container = this.getContainer();
    if (!container || !this.stage) return;

    const containerW = container.clientWidth;
    const containerH = container.clientHeight;

    const scaledW = this.canvasWidth * this.zoom;
    const scaledH = this.canvasHeight * this.zoom;

    let x = this.stage.x();
    let y = this.stage.y();

    if (scaledW <= containerW) {
      x = (containerW - scaledW) / 2;
    } else {
      if (x > 0) x = 0;
      if (x < containerW - scaledW) x = containerW - scaledW;
    }

    if (scaledH <= containerH) {
      y = (containerH - scaledH) / 2;
    } else {
      if (y > 0) y = 0;
      if (y < containerH - scaledH) y = containerH - scaledH;
    }

    this.stage.position({ x, y });
  }

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

  toggleGrid() {
    this.gridless = !this.gridless;
    this.drawGrid();
  }

  drawGrid() {
    if (!this.gridLayer) return;
    this.gridLayer.destroyChildren();

    // board background (recreate)
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

    for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [x, 0, x, this.canvasHeight],
        stroke: '#e0e0e0',
        strokeWidth,
        listening: false
      }));
    }
    for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
      this.gridLayer.add(new Konva.Line({
        points: [0, y, this.canvasWidth, y],
        stroke: '#e0e0e0',
        strokeWidth,
        listening: false
      }));
    }
  }
<<<<<<< HEAD
=======

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
    // this.subscriptions.add(
    //   this.canvasService.color$.subscribe(color => this.changeColor(color))
    // );
    this.subscriptions.add(
      this.canvasService.save$.subscribe(data => this.exportFile(data.type, data.fileName))
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
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
}
