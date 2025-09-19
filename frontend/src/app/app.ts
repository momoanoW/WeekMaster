import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Header } from "./header/header";
import { Nav } from "./nav/nav";
import { Subnav } from "./subnav/subnav";

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header, Nav, Subnav],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('frontend');
}
