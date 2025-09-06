import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password'
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { ActivateAccountComponent } from './auth/activate-account/activate-account';
import { DashboardComponent } from './dashboard/dashboard';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin';

export const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent },
  { path: 'reset-password', component: ResetPasswordComponent },
  { path: 'activate-account', component: ActivateAccountComponent },
  { path: 'dashboard', component: DashboardComponent },
  { path: 'dashboard-admin', component: DashboardAdminComponent },
  { path: '**', redirectTo: 'login' }
];