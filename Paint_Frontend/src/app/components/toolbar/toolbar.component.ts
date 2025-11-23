import { Component, EventEmitter, Output } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [LucideAngularModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.css']
})
export class ToolbarComponent {
  activeTool: string = 'select';
  @Output() toolChange = new EventEmitter<string>();

  setTool(tool: string) {
    this.activeTool = tool;
    this.toolChange.emit(tool);
  }
}
