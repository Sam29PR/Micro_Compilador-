import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EditorComponent } from './components/editor/editor.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, EditorComponent],
  template: `
    <h1>Micro-Compilador</h1>
    <app-editor></app-editor>
  `,
  styles: [`
    h1 {
      text-align: center;
      color: #1976d2;
    }
  `]
})
export class AppComponent {}
