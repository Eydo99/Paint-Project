import { Component, OnInit } from '@angular/core';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-status-bar',
  standalone: true,
  templateUrl: './status-bar.component.html',
  styleUrls: ['./status-bar.component.css']
})
export class StatusBarComponent implements OnInit {

  currentTool: string = 'select';
  mouseX: number = 0;
  mouseY: number = 0;

  selectedShapeName: string = 'None';

  constructor(private canvasService: CanvasService) {}

  ngOnInit() {

    // Tool updates
    this.canvasService.tool$.subscribe(tool => {
      this.currentTool = tool;
    });

    // Mouse updates
    this.canvasService.mousePosition$.subscribe(pos => {
      this.mouseX = pos.x;
      this.mouseY = pos.y;
    });

    // Selected shape updates
    this.canvasService.selectedShape$.subscribe(shape => {
      if (!shape) {
        this.selectedShapeName = 'None';
        return;
      }
      this.selectedShapeName = shape.type || 'Shape';
    });
  }
}
