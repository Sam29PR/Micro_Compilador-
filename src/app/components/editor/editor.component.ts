import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
    selector: 'app-editor',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css'],
    animations: [
        trigger('fadeInOut', [
            transition(':enter', [
                style({ opacity: 0, transform: 'translateY(-10px)' }),
                animate('500ms ease-in-out', style({ opacity: 1, transform: 'translateY(0)' }))
            ]),
            transition(':leave', [
                animate('300ms ease-in-out', style({ opacity: 0, transform: 'translateY(-10px)' }))
            ])
        ])
    ]
})
export class EditorComponent {
    code: string = "";
    output: string = "";
    isSuccess: boolean = false;
    tokens: { type: string, value: string }[] = [];
    filename: string = "";

    constructor(private http: HttpClient) {}

    onCodeChange(event: Event) {
        this.code = (event.target as HTMLTextAreaElement).value;
    }

    /** ✅ Crear un nuevo archivo */
    newFile() {
        this.code = "";
        this.output = "🆕 Nuevo archivo creado.";
        this.tokens = [];
        this.filename = "";
    }

    /** ✅ Abrir un archivo existente */
    openFile(event: any) {
        const file = event.target.files[0];
        if (!file) return;

        this.filename = file.name;

        this.http.post('http://localhost:5000/open-file', { filename: this.filename })
            .subscribe((response: any) => {
                this.code = response.content;
                this.output = `📂 Archivo '${this.filename}' cargado.`;
            }, error => {
                this.output = "⚠ Error: No se pudo abrir el archivo.";
            });
    }

    /** ✅ Eliminar un archivo */
    deleteFile() {
        if (!this.filename) {
            this.output = "⚠ Error: No hay archivo seleccionado.";
            return;
        }

        this.http.post('http://localhost:5000/delete-file', { filename: this.filename })
            .subscribe((response: any) => {
                this.code = "";
                this.output = `🗑 Archivo '${this.filename}' eliminado correctamente.`;
                this.tokens = [];
                this.filename = "";
            }, error => {
                this.output = "⚠ Error: No se pudo eliminar el archivo.";
            });
    }

    /** ✅ Ver los tokens */
    viewTokens() {
        if (!this.code.trim()) {
            this.output = "⚠ No hay código para analizar.";
            return;
        }

        this.http.post('http://localhost:5000/tokens', { code: this.code })
            .subscribe((response: any) => {
                this.tokens = response.tokens;
                this.output = `🔍 Se encontraron ${this.tokens.length} tokens.`;
            }, error => {
                this.output = "⚠ Error al analizar los tokens.";
            });
    }

    /** ✅ Compilar código */
    compileCode() {
        if (!this.code.trim()) {
            this.output = "⚠ No hay código para compilar.";
            return;
        }

        this.http.post('http://localhost:5000/compile', { code: this.code }).subscribe(
            (response: any) => {
                this.output = "✅ Compilación exitosa.";
                this.isSuccess = true;
            },
            error => {
                this.output = `❌ Error de compilación: ${error.error}`;
                this.isSuccess = false;
            }
        );
    }
}
