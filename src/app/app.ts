import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  template: `
    <h1>PRUEBA</h1>
    <p>message: {{ message }}</p>
  `
})
export class App implements OnInit {
  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  message = 'antes de pedir al backend';

  ngOnInit(): void {
    console.log('ngOnInit ejecutado');

    this.http.get('http://localhost:8080/test', { responseType: 'text' }).subscribe({
      next: (response) => {
        console.log('respuesta backend:', response);
        this.message = response;
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('error backend:', error);
        this.message = 'ERROR';
        this.cdr.detectChanges();
      }
    });
  }
}