import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  private apiUrl = 'http://localhost:8080/test'; // Replace with your API URL

  constructor(private http: HttpClient) {}
  
  getUsers(): Observable<any> {
    
    return this.http.get(this.apiUrl, { responseType: 'text' });
  }
  
}
