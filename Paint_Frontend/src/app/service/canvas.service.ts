import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CanvasService {
  // دول subjects
  private actionSource = new Subject<string>();
  private colorSource = new Subject<string>();
  private saveSource = new Subject<{type: string, fileName: string}>();
  private loadSource = new Subject<File>();

  //   الـ Board هي (Subscribe) للقنوات دي
  action$ = this.actionSource.asObservable();
  color$ = this.colorSource.asObservable();
  save$ = this.saveSource.asObservable();
  load$ = this.loadSource.asObservable();

  // دول الـ Navbar هينادي عليهم
  triggerAction(action: string) {
    this.actionSource.next(action); // action could be 'undo', 'copy', 'delete', 'clear'
  }

  changeColor(color: string) {
    this.colorSource.next(color);
  }

  saveFile(type: string, name: string = 'drawing') {
    this.saveSource.next({ type, fileName: name });
  }

  loadFile(file: File) {
    this.loadSource.next(file);
  }
}
