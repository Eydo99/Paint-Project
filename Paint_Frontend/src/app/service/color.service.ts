// /mnt/data/services/color.service.ts
import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ColorService {
  strokeColor = '#000000';
  fillColor = '#ffffff';
  strokeWidth = 1;

  // preview fill used while dragging (semi-transparent)
  fillColorPreview() {
    const c = this.fillColor || '#ffffff';
    // return semi-transparent variant (you can change)
    return c === 'transparent' ? 'rgba(0,0,0,0)' : this.hexToRgba(c, 0.15);
  }

  private hexToRgba(hex: string, alpha = 1) {
    let c = hex.replace('#', '');
    if (c.length === 3) {
      c = c.split('').map(ch => ch + ch).join('');
    }
    const bigint = parseInt(c, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r},${g},${b},${alpha})`;
  }
}
