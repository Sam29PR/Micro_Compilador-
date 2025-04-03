import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CompilerService {
  private apiUrl = 'http://localhost:5000';

  constructor(private http: HttpClient) {}

  getTokens(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/tokens`, { code });
  }

  compileCode(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/compile`, { code });
  }
}
