import { Injectable } from '@angular/core';
import Konva from 'konva';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ShapeToolService {
  private base = 'http://localhost:8080/api/shapes'; // adapt to your backend

  constructor(private http: HttpClient) {}

  // Create shape on backend (called when finishing drawing)
  sendShapeToBackend(payload: any): Observable<any> {
    // POST create endpoint - backend calculates canonical properties (width,height,properties,id...)
    return this.http.post<any>(`${this.base}/create`, payload);
  }

  // Update shape properties (move / resize / rotate)
  updateShape(payload: any): Observable<any> {
    // server endpoint accepts ID and partial updates; adapt path to your API
    const id = payload.id || payload.shapeId;
    if (!id) {
      throw new Error('updateShape requires id in payload');
    }
    // use PATCH to update partial fields
    return this.http.patch<any>(`${this.base}/${id}`, payload);
  }

  // Convert canonical backend shape -> Konva shape (and attach ids)
  createKonvaFromBackend(data: any): Konva.Shape {
    // data expected to contain type, id, fillColor/outlineColor/strokeWidth,
    // x,y,width,height,centerX,centerY,properties,angle etc.
    const common: any = {
      fill: data.fillColor ?? data.properties?.fill ?? '#ffffff',
      stroke: data.outlineColor ?? '#000000',
      strokeWidth: data.strokeWidth ?? 1,
      rotation: data.angle ?? 0
    };

    switch (data.type) {
      case 'rectangle':
      case 'square': {
        const width = data.width ?? data.properties?.width ?? data.properties?.sideLength ?? 0;
        const height = data.height ?? data.properties?.height ?? data.properties?.sideLength ?? 0;
        const rect = new Konva.Rect({
          x: data.x ?? data.topLeft?.x ?? (data.centerX ? data.centerX - width / 2 : 0),
          y: data.y ?? data.topLeft?.y ?? (data.centerY ? data.centerY - height / 2 : 0),
          width,
          height,
          ...common
        }) as unknown as Konva.Shape;
        return rect;
      }

      case 'circle': {
        const r = data.properties?.radius ?? (data.width ? data.width / 2 : 0);
        const circle = new Konva.Circle({
          x: data.centerX ?? data.center?.x ?? (data.x ?? 0) + r,
          y: data.centerY ?? data.center?.y ?? (data.y ?? 0) + r,
          radius: r,
          ...common
        }) as unknown as Konva.Shape;
        return circle;
      }

      case 'ellipse': {
        const rx = data.properties?.radiusX ?? (data.width ? data.width / 2 : 0);
        const ry = data.properties?.radiusY ?? (data.height ? data.height / 2 : 0);
        const ellipse = new Konva.Ellipse({
          x: data.centerX ?? data.center?.x ?? (data.x ?? 0) + rx,
          y: data.centerY ?? data.center?.y ?? (data.y ?? 0) + ry,
          radiusX: rx,
          radiusY: ry,
          ...common
        }) as unknown as Konva.Shape;
        return ellipse;
      }

      case 'triangle': {
        const radius = data.properties?.radius ?? Math.max(data.width ?? 0, data.height ?? 0) / 2;
        const tri = new Konva.RegularPolygon({
          x: data.centerX ?? data.center?.x ?? 0,
          y: data.centerY ?? data.center?.y ?? 0,
          sides: 3,
          radius,
          ...common
        }) as unknown as Konva.Shape;
        return tri;
      }

      case 'line': {
        const points = data.properties?.points ??
          [data.x1 ?? data.x ?? 0, data.y1 ?? data.y ?? 0, data.x2 ?? data.x ?? 0, data.y2 ?? data.y ?? 0];
        const line = new Konva.Line({
          points,
          ...common
        }) as unknown as Konva.Shape;
        return line;
      }

      case 'text': {
        const txt = new Konva.Text({
          x: data.x ?? data.centerX ?? 0,
          y: data.y ?? data.centerY ?? 0,
          text: data.properties?.content ?? '',
          fontSize: data.properties?.fontSize ?? 14,
          fontFamily: data.properties?.fontFamily ?? 'Arial',
          fontStyle: data.properties?.fontStyle ?? '',
          fontWeight: data.properties?.fontWeight ?? '',
          fill: data.properties?.fontColor ?? common.fill
        }) as unknown as Konva.Shape;
        return txt;
      }

      default: {
        // fallback rectangle
        const fallback = new Konva.Rect({
          x: data.x ?? 0,
          y: data.y ?? 0,
          width: data.width ?? 10,
          height: data.height ?? 10,
          ...common
        }) as unknown as Konva.Shape;
        return fallback;
      }
    }
  }
}
