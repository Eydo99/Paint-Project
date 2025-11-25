import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
<<<<<<< HEAD

  // ----------------------------
  // Navbar → Board channels
  // ----------------------------
  private actionSource = new Subject<string>();  
  private colorSource = new Subject<string>();
  private saveSource = new Subject<{ type: string, fileName: string }>();
=======
  // دول subjects
  private actionSource = new Subject<string>();
 // private colorSource = new Subject<string>();
  private saveSource = new Subject<{type: string, fileName: string}>();
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
  private loadSource = new Subject<File>();

  action$ = this.actionSource.asObservable();
<<<<<<< HEAD
  color$ = this.colorSource.asObservable();
  save$  = this.saveSource.asObservable();
  load$  = this.loadSource.asObservable();
=======
  save$ = this.saveSource.asObservable();
  load$ = this.loadSource.asObservable();
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370

  // ----------------------------
  // Toolbar → Board (active tool)
  // ----------------------------
  private toolSource = new Subject<string>();
  tool$ = this.toolSource.asObservable();

<<<<<<< HEAD
=======

  // ✨ الجديد: للـ Tool من الـ Toolbar
  private toolSource = new Subject<string>();  // نخليها private عشان نستخدم asObservable
  tool$ = this.toolSource.asObservable();      // Observable للـ Board

  // Add after the tool$ observable (around line 25):

  // ✨ NEW: For mouse position tracking
  private mousePositionSource = new Subject<{x: number, y: number}>();
  mousePosition$ = this.mousePositionSource.asObservable();

  // ✨ NEW: For default colors
  private defaultFillColorSource = new Subject<string>();
  private defaultStrokeColorSource = new Subject<string>();
  defaultFillColor$ = this.defaultFillColorSource.asObservable();
  defaultStrokeColor$ = this.defaultStrokeColorSource.asObservable();

// Current default colors
  private currentDefaultFill = '#ffffff';
  private currentDefaultStroke = '#090101';

// Methods to change default colors
  setDefaultFillColor(color: string) {
    this.currentDefaultFill = color;
    this.defaultFillColorSource.next(color);
  }

  setDefaultStrokeColor(color: string) {
    this.currentDefaultStroke = color;
    this.defaultStrokeColorSource.next(color);
  }

// Getters for current defaults
  getDefaultFillColor(): string {
    return this.currentDefaultFill;
  }

  getDefaultStrokeColor(): string {
    return this.currentDefaultStroke;
  }




// Method to update mouse position
  updateMousePosition(x: number, y: number) {
    this.mousePositionSource.next({ x, y });
  }

  ////////////////////////////////////////////////////////////////////////////
// ✨ NEW: For Properties Bar communication
  private selectedShapeSource = new Subject<any>();
  selectedShape$ = this.selectedShapeSource.asObservable();

// Method to notify when a shape is selected
  selectShape(shapeData: any) {
    this.selectedShapeSource.next(shapeData);
  }

// Methods to update shape properties
  updateFillColor(shapeId: string, color: string) {
    // This will be handled in the board component
    this.actionSource.next(`update-fill:${shapeId}:${color}`);
  }

  updateStroke(shapeId: string, color: string, width: number) {
    this.actionSource.next(`update-stroke:${shapeId}:${color}:${width}`);
  }

  updateSize(shapeId: string, width: number, height: number) {
    this.actionSource.next(`update-size:${shapeId}:${width}:${height}`);
  }

  updatePosition(shapeId: string, x: number, y: number) {
    this.actionSource.next(`update-position:${shapeId}:${x}:${y}`);
  }

/////////////////////////////////////////////////////////////////////////////////

  // Method لتغيير الـ Tool
>>>>>>> 5e5c3906d7e7f6b45d74b98217a5f7a951802370
  setTool(tool: string) {
    this.toolSource.next(tool);
  }

  // ----------------------------
  // Selected Shape + Mouse Pos
  // ----------------------------
  selectedShape$ = new BehaviorSubject<any>(null);

  mousePosition$ = new BehaviorSubject<{ x: number, y: number }>({
    x: 0,
    y: 0
  });

  setSelectedShape(shape: any) {
    this.selectedShape$.next(shape);
  }

  setMousePosition(x: number, y: number) {
    this.mousePosition$.next({ x, y });
  }

  // ----------------------------
  // Properties Bar → Board
  // (fill, stroke, size, position)
  // ----------------------------
  private shapeFillChangeSource = new Subject<{ shapeId: string, color: string }>();
  private shapeStrokeChangeSource = new Subject<{ shapeId: string, stroke: string, width: number }>();
  private shapeSizeChangeSource = new Subject<{ shapeId: string, width: number, height: number }>();
  private shapePositionChangeSource = new Subject<{ shapeId: string, x: number, y: number }>();

  shapeFillChange$    = this.shapeFillChangeSource.asObservable();
  shapeStrokeChange$  = this.shapeStrokeChangeSource.asObservable();
  shapeSizeChange$    = this.shapeSizeChangeSource.asObservable();
  shapePositionChange$ = this.shapePositionChangeSource.asObservable();

  updateFillColor(shapeId: string, color: string) {
    this.shapeFillChangeSource.next({ shapeId, color });
  }

  updateStroke(shapeId: string, stroke: string, width: number) {
    this.shapeStrokeChangeSource.next({ shapeId, stroke, width });
  }

  updateSize(shapeId: string, width: number, height: number) {
    this.shapeSizeChangeSource.next({ shapeId, width, height });
  }

  updatePosition(shapeId: string, x: number, y: number) {
    this.shapePositionChangeSource.next({ shapeId, x, y });
  }

  // ----------------------------
  // Navbar actions (undo, redo, delete…)
  // ----------------------------
  triggerAction(action: string) {
    this.actionSource.next(action);
  }



  saveFile(type: string, name: string = 'drawing') {
    this.saveSource.next({ type, fileName: name });
  }

  loadFile(file: File) {
    this.loadSource.next(file);
  }
}
