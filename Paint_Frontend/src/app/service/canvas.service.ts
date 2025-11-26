import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  // دول subjects
  private actionSource = new Subject<string>();
  // private colorSource = new Subject<string>();
  private saveSource = new Subject<{ type: string, fileName: string, path?: string }>();
  private loadSource = new Subject<File>();

  //   الـ Board هي (Subscribe) للقنوات دي
  action$ = this.actionSource.asObservable();
  save$ = this.saveSource.asObservable();
  load$ = this.loadSource.asObservable();



  // ✨ الجديد: للـ Tool من الـ Toolbar
  private toolSource = new Subject<string>();  // نخليها private عشان نستخدم asObservable
  tool$ = this.toolSource.asObservable();      // Observable للـ Board

  // Add after the tool$ observable (around line 25):

  // ✨ NEW: For mouse position tracking
  private mousePositionSource = new Subject<{ x: number, y: number }>();
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
  setTool(tool: string) {
    this.toolSource.next(tool);
  }






  // دول الـ Navbar هينادي عليهم
  triggerAction(action: string) {
    this.actionSource.next(action); // action could be 'undo', 'copy', 'delete', 'clear'
  }



  saveFile(type: string, name: string = 'drawing', path: string = '') {
    this.saveSource.next({ type, fileName: name, path });
  }

  loadFile(file: File) {
    this.loadSource.next(file);
  }
}