import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { NavbarComponent } from "./components/navbar/navbar.component";
import { ToolbarComponent } from "./components/toolbar/toolbar.component";
import { BoardComponent } from "./components/board/board.component";
import { PropertiesBarComponent } from "./components/properties-bar/properties-bar.component";
import { StatusBarComponent } from "./components/status-bar/status-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet,
    NavbarComponent,
    ToolbarComponent,
    BoardComponent,
    PropertiesBarComponent,
    StatusBarComponent,
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'PaintProject';
}
