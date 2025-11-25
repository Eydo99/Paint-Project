import { Injectable } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {

  // ----------------------------
  // Navbar → Board channels
  // ----------------------------
  private actionSource = new Subject<string>();  
  private colorSource = new Subject<string>();
  private saveSource = new Subject<{ type: string, fileName: string }>();
  private loadSource = new Subject<File>();

  action$ = this.actionSource.asObservable();
  color$ = this.colorSource.asObservable();
  save$  = this.saveSource.asObservable();
  load$  = this.loadSource.asObservable();

  // ----------------------------
  // Toolbar → Board (active tool)
  // ----------------------------
  private toolSource = new Subject<string>();
  tool$ = this.toolSource.asObservable();

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

  changeColor(color: string) {
    this.colorSource.next(color);
  }

  saveFile(type: string, name: string = 'drawing') {
    this.saveSource.next({ type, fileName: name });
  }

  loadFile(file: File) {
    this.loadSource.next(file);
  }
}
