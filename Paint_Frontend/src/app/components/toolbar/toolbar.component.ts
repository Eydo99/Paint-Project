import { Component, EventEmitter, Output } from '@angular/core';
import { LucideAngularModule, MousePointer, Move, Crop, RotateCw,
  RectangleHorizontal, Square, Circle, Triangle, Minus, Type,
  Brush, Pencil, Signature, Eraser, PaintBucket, Pipette,
  Copy, Trash } from 'lucide-angular';
import { CanvasService } from '../../service/canvas.service';
import {HttpClient} from "@angular/common/http";

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  activeTool: string = 'select';

  // تسجيل جميع الأيقونات المستخدمة
  readonly icons = {
    MousePointer,
    Move,
    Crop,
    RotateCw,
    RectangleHorizontal,
    Square,
    Circle,
    Triangle,
    Minus,
    Type,
    Brush,
    Pencil,
    Signature,
    Eraser,  // الاسم الصحيح
    PaintBucket,
    Pipette,
    Copy,
    Trash
  };
   constructor(private canvasService: CanvasService) {}

  //
  @Output() toolChange = new EventEmitter<string>();
  //



  setTool(tool: string) {
    this.activeTool = tool;
    this.toolChange.emit(tool);
    this.canvasService.setTool(tool);
  }
}
