import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Register } from './register/register';
import { VerifyEmail } from './verify-email/verify-email';
import { Dashboard } from './dashboard/dashboard';
import { Home } from './home/home';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'verify-email', component: VerifyEmail },
  { path: 'dashboard', component: Dashboard },
  { path: 'home', component: Home },
];
