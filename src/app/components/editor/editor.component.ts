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
stopExecution() {
throw new Error('Method not implemented.');
}
openFile() {
throw new Error('Method not implemented.');
}
    code: string = "";
    output: string = "";
    isSuccess: boolean = false;
    tokens: { type: string, value: string }[] = [];
    filename: string = "";
    codigo: string = '';
    nombreArchivo: string = 'nuevo_codigo.txt';
    esNuevoArchivo: boolean = true;

      // NUEVAS variables PARA EJECUCIÓN (añade solo estas)
    isExecuting: boolean = false;
    isCompiled: boolean = false;
    currentStep: number = 0;
    totalSteps: number = 0;
    executionMode: 'full' | 'step' = 'full';
    executionVariables: Array<{ name: string; value: any; type: string }> = []; // Definición única




    // Referencia al input para abrir archivos
    @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

    constructor(private http: HttpClient) {}

    onCodeChange(event: Event) {
        this.code = (event.target as HTMLTextAreaElement).value;
    }

    /** ✅ Crear un nuevo archivo (solo web) */

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
    /** ✅ Ejecutar código paso a paso */
    /**runCode() {
    if (!this.code.trim()) {
        this.output = "⚠ No hay código para ejecutar.";
        return;
    }
    this.executionMode =this.executionMode;
        this.isExecuting = true;

        if (this.executionMode === 'full') {
            this.executeFullRun();
        } else {
            this.executeStepByStep();
        }    
    }*/

 
    executeFull(): void {
        if (!this.code.trim()) {
            this.output = "⚠ No hay código para ejecutar.";
            return;
        }

        this.isExecuting = true;
        this.executionMode = 'full';
        this.output = "Iniciando ejecución completa...";
    
        this.http.post<any>("http://localhost:5000/execute", { code: this.code }).subscribe({
            next: (res) => {
                this.output = `🚀 Resultado:\n${res.output?.join('\n') || ''}`;
                this.executionVariables = this.mapVariables(res.variables || {});
                this.isSuccess = true;
            },
            error: (err: any) => {
                this.output = "⚠ Error: " + (err.error?.error?.join('\n') || "Error en ejecución");
                this.isSuccess = false;
            },
            complete: () => {
                this.isExecuting = false;
            }
        });
    }

        // Método para paso a paso
    executeStep(): void {
        if (!this.code.trim()) {
            this.output = "⚠ No hay código para ejecutar.";
            return;
        }

        if (!this.isCompiled) {
            this.output = "ℹ Primero debes compilar el código";
            return;
        }

    this.isExecuting = true;
    this.executionMode = 'step';
    this.output = "Preparando ejecución paso a paso...";
    
        this.http.post<any>("http://localhost:5000/execute-step", {}).subscribe({
            next: (res: any) => {
                if (res.status === 'completed') {
                    this.output += "\n\n✅ Ejecución completada";
                    this.isExecuting = false;
                } else {
                    this.output = `🔹 Paso ${res.current_step}/${res.total_steps}:\n${res.output}`;
                    this.executionVariables = this.mapVariables(res.variables || {});
                    this.currentStep = res.current_step;
                    this.totalSteps = res.total_steps;
                }
            },
            error: (err: any) => {
                this.output = "⚠ Error: " + err.message;
                this.isExecuting = false;
            }
        });
    }

       private mapVariables(vars: any): Array<{ name: string; value: any; type: string }> {
        return Object.keys(vars || {}).map(key => ({
            name: key,
            value: vars[key],
            type: typeof vars[key]
        }));
    }

    
downloadManual() {
  // Ruta relativa desde la raíz del proyecto
  const pdfUrl = './assets/Manual_Tecnico_del_Micro.pdf'; 
  
  // Crear enlace temporal
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'Manual_Tecnico_MicroCompilador.pdf'; // Nombre al descargar
  
  // Simular click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

downloadUsuario() {
  // Ruta relativa desde la raíz del proyecto
  const pdfUrl = './assets/Guia_rapida_del_Micro.pdf'; 
  
  // Crear enlace temporal
  const link = document.createElement('a');
  link.href = pdfUrl;
  link.download = 'Guia_rapida_del_MicroCompilador.pdf'; // Nombre al descargar
  
  // Simular click
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
}





