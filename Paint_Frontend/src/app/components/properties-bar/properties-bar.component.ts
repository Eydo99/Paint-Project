import { Component, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-properties-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './properties-bar.component.html',
  styleUrls: ['./properties-bar.component.css']
})
export class PropertiesBarComponent {

  // ✨ ViewChild للوصول للـ Color Pickers المخفية
  @ViewChild('fillColorPicker') fillColorPicker!: ElementRef<HTMLInputElement>;
  @ViewChild('strokeColorPicker') strokeColorPicker!: ElementRef<HTMLInputElement>;

  fillColor = '#93c5fd';
  strokeColor = '#3b82f6';
  strokeWidth = 2;

  width = 0;
  height = 0;
  posX = 0;
  posY = 0;

  shapeType: string | null = null;
  currentShapeId: string | null = null;

  constructor(private canvasService: CanvasService) {
    this.canvasService.selectedShape$.subscribe(shape => {
      if (!shape) return;

      this.currentShapeId = shape.id;
      this.shapeType = shape.type;

      this.fillColor = shape.fill;
      this.strokeColor = shape.stroke;
      this.strokeWidth = shape.strokeWidth;

      this.width = shape.width;
      this.height = shape.height;

      this.posX = shape.x;
      this.posY = shape.y;
    });
  }

  // ✨ فتح Fill Color Picker
  openFillColorPicker() {
    this.fillColorPicker.nativeElement.click();
  }

  // ✨ فتح Stroke Color Picker
  openStrokeColorPicker() {
    this.strokeColorPicker.nativeElement.click();
  }

  // ✨ تغيير Fill Color من Picker
  onFillColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.fillColor = input.value;
    this.updateFill();
  }

  // ✨ تغيير Stroke Color من Picker
  onStrokeColorChange(event: Event) {
    const input = event.target as HTMLInputElement;
    this.strokeColor = input.value;
    this.updateStroke();
  }

  updateFill() {
    if (this.currentShapeId) {
      this.canvasService.updateFillColor(this.currentShapeId, this.fillColor);
    }
  }

  updateStroke() {
    if (this.currentShapeId) {
      this.canvasService.updateStroke(this.currentShapeId, this.strokeColor, this.strokeWidth);
    }
  }

  updateSize() {
    if (this.currentShapeId) {
      this.canvasService.updateSize(this.currentShapeId, this.width, this.height);
    }
  }

  updatePosition() {
    if (this.currentShapeId) {
      this.canvasService.updatePosition(this.currentShapeId, this.posX, this.posY);
    }
  }
}
