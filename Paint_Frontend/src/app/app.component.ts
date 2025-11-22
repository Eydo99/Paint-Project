import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {BoardComponent} from "./components/board/board.component";
import {NavbarComponent} from "./components/navbar/navbar.component";
import {ToolbarComponent} from "./components/toolbar/toolbar.component";
import {PropertiesBarComponent} from "./components/properties-bar/properties-bar.component";
import {StatusBarComponent} from "./components/status-bar/status-bar.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, BoardComponent, NavbarComponent, ToolbarComponent, PropertiesBarComponent, StatusBarComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'PaintProject';
}
