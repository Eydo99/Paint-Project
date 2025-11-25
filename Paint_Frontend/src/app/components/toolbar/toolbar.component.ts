import { Component, EventEmitter, Output } from '@angular/core';
import {
  LucideAngularModule, MousePointer, Move, Crop, RotateCw,
  RectangleHorizontal, Square, Circle, Triangle, Minus, Type,
  Brush, Pencil, Signature, Eraser, PaintBucket, Pipette,
  Copy, Trash
} from 'lucide-angular';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {

  activeTool: string = 'select';

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
    Eraser,
    PaintBucket,
    Pipette,
    Copy,
    Trash
  };

  constructor(private canvasService: CanvasService) {}

  @Output() toolChange = new EventEmitter<string>();

  /**
   * Set the active tool and notify both:
   * 1) The parent (board listens using (toolChange))
   * 2) The global canvas service
   */
  setTool(tool: string) {
    this.activeTool = tool;

    // notify board
    this.toolChange.emit(tool);

    // notify services and properties panel
    this.canvasService.setTool(tool);
  }
}
