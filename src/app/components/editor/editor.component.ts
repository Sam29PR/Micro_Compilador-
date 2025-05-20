import { Component, ViewChild, ElementRef } from '@angular/core';
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
openFile() {
throw new Error('Method not implemented.');
}
    code: string = "";
    output: string = "";
    isSuccess: boolean = false;
    tokens: { type: string, value: string }[] = [];
    filename: string = "";

    // Referencia al input para abrir archivos
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

    constructor(private http: HttpClient) {}

    onCodeChange(event: Event) {
        this.code = (event.target as HTMLTextAreaElement).value;
    }

    /** ✅ Crear un nuevo archivo (solo web) */
    codigo: string = '';
    nombreArchivo: string = 'nuevo_codigo.txt';
    esNuevoArchivo: boolean = true;

    nuevoArchivo() {
        this.code = '';
        this.filename = 'nuevo_codigo.txt';
        this.output = '🆕 Nuevo archivo creado.';
    }

    /** ✅ Abrir un archivo local (solo web) */
    openFileLocal(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = () => {
                this.code = reader.result as string;
                this.filename = file.name;
                this.output = `📂 Archivo '${this.filename}' cargado desde el sistema.`;
            };
            reader.readAsText(file);
        }
    }

    /** ✅ Eliminar archivo (solo web) */
    deleteFileLocal() {
        if (!this.code.trim()) {
            this.output = "⚠ No hay código para eliminar.";
            return;
        }

        this.code = '';
        this.filename = '';
        this.output = "🗑 Archivo borrado (localmente en la sesión).";
    }

    /** ✅ Guardar archivo (solo web) */
    saveFile() {
        const blob = new Blob([this.code], { type: 'text/plain;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = this.filename || 'codigo.txt';
        link.click();
        this.output = `💾 Archivo '${this.filename || 'codigo.txt'}' guardado.`;
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

        this.http.post<any>("http://localhost:5000/compile", {code: this.code}).subscribe({
            next: (res) => {
                this.output = res.message;
                this.isSuccess = true;},

        error: (err) => {
            this.output = err.error?.error?.join('\n') || "Error desconocido";
            this.isSuccess = false;

            }
        }

        );

    }
}





