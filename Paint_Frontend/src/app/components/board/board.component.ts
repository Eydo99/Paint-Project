import { Component, OnInit, OnDestroy, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as fabric from 'fabric';
import { Subscription } from 'rxjs';
import { CanvasService } from '../../service/canvas.service';

@Component({
  selector: 'app-board',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './board.component.html',
  styleUrls: ['./board.component.css']
})
export class BoardComponent implements OnInit, OnDestroy, AfterViewInit {

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;

  canvas!: fabric.Canvas;

  gridless = false;

  private subscriptions: Subscription = new Subscription();// بخزن فيها ال subscribes عشان الغيهم فالاخر

  private history: any[] = [];
  private currentStateIndex: number = -1;

  private readonly BACKEND_URL = 'http://localhost:8080/api/files';

  constructor(
    private canvasService: CanvasService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {

    this.setupSubscriptions();
  }

  ngAfterViewInit(): void {
    // جيب الـ parent element. canvasRef
    // جيب عرضه وطوله
    // لو مش موجود، استخدم 960×720
    const parentElement = this.canvasRef.nativeElement.parentElement;
    const width = parentElement?.clientWidth || 960;
    const height = parentElement?.clientHeight || 720;

    //ادي الحجات دي للكانفاس بناع ال fabric
    this.canvas = new fabric.Canvas(this.canvasRef.nativeElement, {
      selection: true,
      width: width,
      height: height,
      backgroundColor: 'white'
    });

    this.canvas.on('object:modified', () => this.updateHistory());
    this.canvas.on('object:added', () => this.updateHistory());

    this.updateHistory();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleGrid() {
    this.gridless = !this.gridless;
  }

  private setupSubscriptions(): void {
    this.subscriptions.add(
      this.canvasService.action$.subscribe(action => {
        this.handleAction(action);
      })
    );

    this.subscriptions.add(
      this.canvasService.color$.subscribe(color => {
        this.changeColor(color);
      })
    );

    this.subscriptions.add(
      this.canvasService.save$.subscribe(saveData => {
        this.prepareAndSave(saveData.type, saveData.fileName);
      })
    );

    this.subscriptions.add(
      this.canvasService.load$.subscribe(file => {
        this.loadFile(file);
      })
    );
  }

  private handleAction(action: string): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();

    switch (action) {
      //لو في شكل محدد
      // انسخه
      // شيل التحديد من الشكل القديم
      // حرك النسخة الجديدة 10 بكسل لليمين وتحت
      // ضيفها للكانفاس
      // حددها
      // ارسم الكانفاس تاني
      // خزن في الهستوري
      case 'copy':
        if (activeObject) {
          const cloningCallback = ((cloned: fabric.Object): void => {
            this.canvas.discardActiveObject();
            cloned.set({
              left: cloned.left! + 10,
              top: cloned.top! + 10,
            });
            this.canvas.add(cloned);
            this.canvas.setActiveObject(cloned);
            this.canvas.requestRenderAll();
            this.updateHistory();
          }) as any;

          activeObject.clone(cloningCallback);
        }
        break;
      case 'delete':
        if (activeObject) {
          this.canvas.remove(activeObject);
          this.updateHistory();
        }
        break;
      case 'clear':
        this.canvas.clear();
        this.canvas.backgroundColor = 'white';
        this.canvas.renderAll();
        this.updateHistory();
        break;
      case 'undo':
        this.undo();
        break;
      case 'redo':
        this.redo();
        break;
    }
  }

  private changeColor(color: string): void {
    if (!this.canvas) return;

    const activeObject = this.canvas.getActiveObject();

    if (activeObject) {
      activeObject.set({ fill: color, stroke: color });
      this.canvas.renderAll();
      this.updateHistory();
    }
  }

  private prepareAndSave(type: string, fileName: string): void {
    if (!this.canvas) return;

    const canvasData = JSON.stringify(this.canvas.toJSON());

    const payload = {
      name: fileName,
      type: type,
      data: canvasData
    };
    //{
    //   "version": "5.3.0",
    //   "objects": [
    //     {
    //       "type": "rect",
    //       "left": 100,
    //       "top": 100,
    //       "width": 200,
    //       "height": 150,
    //       "fill": "#FF0000",
    //       "stroke": null,
    //       "strokeWidth": 1,
    //       "opacity": 1,
    //       "angle": 0,
    //       "scaleX": 1,
    //       "scaleY": 1
    //     },
    //     {
    //       "type": "circle",
    //       "left": 300,
    //       "top": 200,
    //       "radius": 50,
    //       "fill": "#0000FF",
    //       "stroke": "#000000",
    //       "strokeWidth": 2
    //     }
    //   ],
    //   "background": "white"
    // }

    this.http.post(`${this.BACKEND_URL}/save`, payload).subscribe({
      next: (response) => {
        console.log(`File saved successfully as ${type}!`, response);
        alert(`File saved successfully as ${type}!`);
      },
      error: (err) => {
        console.error(`Error saving ${type}:`, err);
        alert(`Error saving file: ${err.message}`);
      }
    });
  }

  private loadFile(file: File): void {
    if (!this.canvas) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const fileContent = e.target?.result as string;
      try {
        this.canvas.loadFromJSON(fileContent, () => {
          this.canvas.renderAll();
          this.updateHistory();
          console.log('File loaded successfully!');
        });
      } catch (error) {
        console.error("Error loading file content:", error);
        alert('Error loading file!');
      }
    };
    reader.readAsText(file);
  }

  private updateHistory(): void {
    const json = JSON.stringify(this.canvas.toJSON());


    //مفروض هنا ابعت للباك (تقريبا history[] دي مفروض تبقي فالباك
    // بس خليها كدا دلوقتي
    if (this.currentStateIndex < this.history.length - 1) {
      this.history = this.history.slice(0, this.currentStateIndex + 1);
    }

    this.history.push(json);
    this.currentStateIndex = this.history.length - 1;
  }

  private undo(): void {
    if (this.currentStateIndex > 0) {
      this.currentStateIndex--;
      this.loadCanvasState(this.history[this.currentStateIndex]);
    }
  }

  private redo(): void {
    if (this.currentStateIndex < this.history.length - 1) {
      this.currentStateIndex++;
      this.loadCanvasState(this.history[this.currentStateIndex]);
    }
  }

  private loadCanvasState(state: any): void {
    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();
    });
  }
}
