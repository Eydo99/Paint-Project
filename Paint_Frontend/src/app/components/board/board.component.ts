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

  // grid + zoom (kept from earlier)
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
    }

    this.gridLayer.visible(!this.gridless);
    this.gridLayer.draw();
  }

  toggleGrid() {
    this.gridless = !this.gridless;
    this.gridLayer.visible(!this.gridless);
    this.gridLayer.batchDraw();
  }

  // ---------------- Zoom ----------------
  onZoomSelect(event: any) {
    const value = event.target.value;
    if (value === 'fit') {
      this.fitToScreen();
      return;
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
