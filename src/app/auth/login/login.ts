import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../material.imports';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './login.html',
  styleUrls: ['./login.css']
})
export class LoginComponent {
  credentials = {
    email: '',
    password: ''
  };
  
  rememberMe: boolean = false;
  hidePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    this.isLoading = true;

    this.authService.login(this.credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Obtener el usuario actual para verificar el rol
        const user = this.authService.getCurrentUser();
        
        // Mostrar mensaje de éxito
        this.snackBar.open(
          `¡Bienvenido ${user?.nombres || 'Usuario'}!`, 
          'Cerrar', 
          {
            duration: 3000,
            panelClass: ['success-snackbar']
          }
        );

        // Actualizar actividad
        this.authService.updateActivity();

        // Redirigir usando el método del AuthService
        setTimeout(() => {
          const returnUrl = this.authService.getReturnUrl();
          this.router.navigateByUrl(returnUrl);
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Manejar errores específicos
        let errorMessage = 'Error al iniciar sesión';
        
        if (error.status === 401) {
          errorMessage = 'Credenciales incorrectas';
        } else if (error.status === 403) {
          errorMessage = 'Su cuenta no está activa. Revise su correo para activarla';
        } else if (error.status === 404) {
          errorMessage = 'Usuario no encontrado';
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Intente más tarde';
        } else if (error.error?.message) {
          errorMessage = error.error.message;
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}