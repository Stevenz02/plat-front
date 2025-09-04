import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../material.imports';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './forgot-password.html',
  styleUrls: ['./forgot-password.css']
})
export class ForgotPasswordComponent {
  email: string = '';
  isLoading: boolean = false;
  emailSent: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onSubmit(): void {
    if (!this.email) {
      this.snackBar.open('Por favor ingrese su email', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    if (!this.isValidEmail(this.email)) {
      this.snackBar.open('Por favor ingrese un email válido', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    this.authService.forgotPassword(this.email).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.emailSent = true;
        
        this.snackBar.open(
          response.message || 'Si el email está registrado, recibirás las instrucciones de recuperación',
          'Cerrar',
          {
            duration: 8000,
            panelClass: ['success-snackbar']
          }
        );
      },
      error: (error) => {
        this.isLoading = false;
        
        let errorMessage = 'Error al enviar las instrucciones';
        
        if (error.status === 400) {
          errorMessage = 'El nombre del rol es requerido'; // Según tu Swagger
        } else if (error.status === 500) {
          errorMessage = 'Error interno del servidor. Intente más tarde';
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

  isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  goBackToLogin(): void {
    this.router.navigate(['/login']);
  }

  resendEmail(): void {
    this.emailSent = false;
    this.onSubmit();
  }
}
