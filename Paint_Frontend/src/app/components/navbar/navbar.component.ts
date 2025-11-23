import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule], //  ngIf و ngFor
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  openMenu: string | null = null;

  colors: string[] = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FFA500', '#800080'];

  constructor(private canvasService: CanvasService) {}


  toggleMenu(menuName: string) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  // 1. هنا (Copy, Delete, Clear, Undo, Redo)
  performAction(action: string) {
    this.canvasService.triggerAction(action);
    this.openMenu = null; // نقفل القايمة
  }

  // 2. Color Logic
  selectColor(color: string) {
    this.canvasService.changeColor(color);
    this.openMenu = null;
  }

  // 3. Save Logic
  saveFile(format: 'json' | 'xml') {
    // هنا ممكن تفتح Popup تطلب اسم الملف، بس هبعت اسم افتراضي دلوقتي
    this.canvasService.saveFile(format, 'my-paint-project');
    this.openMenu = null;
  }

  // 4. Load Logic
  onFileSelected(event: any) {
    const file = event.target.files[0];// اول اختيار
    if (file) {
      this.canvasService.loadFile(file);
    }
    this.openMenu = null;
  }
}
