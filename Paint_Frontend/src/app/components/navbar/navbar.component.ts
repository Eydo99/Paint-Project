import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  openMenu: string | null = null;

  colors: string[] = [
    '#000000', '#FF0000', '#00FF00', '#0000FF',
    '#FFFF00', '#FFA500', '#800080'
  ];

  constructor(private canvasService: CanvasService) {}

  toggleMenu(menuName: string) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  performAction(action: string) {
    this.canvasService.triggerAction(action);
    this.openMenu = null;
  }

  selectColor(color: string) {
    this.canvasService.changeColor(color);
    this.openMenu = null;
  }

  saveFile(format: 'json' | 'xml') {
    this.canvasService.saveFile(format, 'my-paint-project');
    this.openMenu = null;
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.canvasService.loadFile(file);
    this.openMenu = null;
  }
}
