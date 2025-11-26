import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CanvasService } from '../../service/canvas.service';
import { FormsModule } from '@angular/forms';
@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {

  openMenu: string | null = null;

  showSaveDialog: boolean = false;
  saveFormat: 'json' | 'xml' = 'json';
  saveFileName: string = 'my-paint-project';
  savePath: string = '';

  // ✨ NEW: Track current default colors
  currentFillColor: string = '#ffffff';
  currentStrokeColor: string = '#090101';

  // ✨ NEW: Color mode selection
  colorMode: 'fill' | 'stroke' = 'fill';

  // ✨ EXPANDED: More colors
  colors: string[] = [
    // Basic colors
    '#000000', '#FFFFFF', '#808080', '#C0C0C0',
    // Red shades
    '#FF0000', '#FF6B6B', '#DC143C', '#8B0000',
    // Orange & Yellow
    '#FFA500', '#FFD700', '#FFFF00', '#F0E68C',
    // Green shades
    '#00FF00', '#32CD32', '#228B22', '#006400',
    // Blue shades
    '#0000FF', '#1E90FF', '#4169E1', '#000080',
    // Purple & Pink
    '#800080', '#9370DB', '#FF00FF', '#FF69B4',
    // Brown & Beige
    '#8B4513', '#A0522D', '#D2691E', '#F5DEB3',
    // Cyan & Teal
    '#00FFFF', '#20B2AA', '#008B8B', '#008080'
  ];

  constructor(private canvasService: CanvasService) { }

  toggleMenu(menuName: string) {
    this.openMenu = this.openMenu === menuName ? null : menuName;
  }

  // ✨ NEW: Toggle between fill and stroke mode
  setColorMode(mode: 'fill' | 'stroke') {
    this.colorMode = mode;
  }

  performAction(action: string) {
    this.canvasService.triggerAction(action);
    this.openMenu = null;
  }

  // ✨ UPDATED: Select color based on mode and track it
  selectColor(color: string) {
    if (this.colorMode === 'fill') {
      this.currentFillColor = color;  // ✨ Track current fill
      this.canvasService.setDefaultFillColor(color);
    } else {
      this.currentStrokeColor = color;  // ✨ Track current stroke
      this.canvasService.setDefaultStrokeColor(color);
    }
    // Also change selected shapes if any
    this.openMenu = null;
  }

  // ✨ UPDATED: Open save dialog instead of direct save
  openSaveDialog(format: 'json' | 'xml') {
    this.saveFormat = format;
    this.showSaveDialog = true;
    this.openMenu = null;
  }

  // ✨ NEW: Close save dialog
  closeSaveDialog() {
    this.showSaveDialog = false;
    this.saveFileName = 'my-paint-project';
    this.savePath = '';
  }

  // ✨ NEW: Confirm save with path and filename
  confirmSave() {
    if (!this.saveFileName.trim()) {
      alert('Please enter a file name');
      return;
    }

    this.canvasService.saveFile(
      this.saveFormat,
      this.saveFileName.trim(),
      this.savePath.trim()
    );
    this.closeSaveDialog();
  }
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.canvasService.loadFile(file);
    }
    this.openMenu = null;
  }
}