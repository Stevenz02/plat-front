import { Component } from '@angular/core';
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
  email: string = '';
  password: string = '';
  rememberMe: boolean = false;
  hidePassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    // private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onLogin() {
    this.isLoading = true;

    const loginData = {
      email: this.email,
      password: this.password
    };
  }}
/*
    this.authService.login(loginData).subscribe({
      next: (response) => {
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open('¡Inicio de sesión exitoso!', 'Cerrar', {
          duration: 3000,
          panelClass: ['success-snackbar']
        });

        // Redirigir según rol
        const rol = response.user?.rol || '';
        setTimeout(() => {
          if (rol === 'ADMINISTRADOR' || rol === 'TECNICO') {
            this.router.navigate(['/dashboard-admin']);
          } else {
            this.router.navigate(['/dashboard']);
          }
        }, 500);
      },
      error: (error) => {
        this.isLoading = false;
        
        // Mostrar mensaje de error
        this.snackBar.open(
          error.error?.message || 'Credenciales incorrectas', 
          'Cerrar', 
          {
            duration: 5000,
            panelClass: ['error-snackbar']
          }
        );
      }
    });
  }
}
*/