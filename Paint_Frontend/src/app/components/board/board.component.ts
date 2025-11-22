import { Component, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import * as fabric from 'fabric';

@Component({
  selector: 'app-board',
  standalone: true,
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements AfterViewInit {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  canvas!: fabric.Canvas;

  ngAfterViewInit(): void {
    const parentElement = this.canvasRef.nativeElement.parentElement;
    const width = parentElement?.clientWidth || 800;
    const height = parentElement?.clientHeight || 600;


    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      selection: true,
      width: width,
      height: height
    });

    // const rect = new fabric.Rect({
    //   fill: 'red',
    //   width: 100,
    //   height: 100,
    //   left: 200,
    //   top: 150
    // });
    //
    // this.canvas.add(rect);

  }
}
