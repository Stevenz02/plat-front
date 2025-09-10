import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../material.imports';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './register.html',
  styleUrls: ['./register.css']
})
export class RegisterComponent {
  userData = {
    email: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    departamento: '',
    cargo: '',
    password: ''
  };

  confirmPassword: string = '';
  hidePassword: boolean = true;
  hideConfirmPassword: boolean = true;
  isLoading: boolean = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  onRegister() {
    // Validar que las contraseñas coincidan
    if (this.userData.password !== this.confirmPassword) {
      this.snackBar.open('Las contraseñas no coinciden', 'Cerrar', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
      return;
    }

    this.isLoading = true;

    // Usar el servicio auth para registrar
    this.authService.register(this.userData).subscribe({
      next: (response: any) => {
        this.isLoading = false;
        
        // Mostrar mensaje de éxito
        this.snackBar.open(
          '¡Registro exitoso! Revise su correo para activar su cuenta.', 
          'Cerrar', 
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

    // Redirigir a activación con el email pre-llenado
    this.router.navigate(['/activate-account'], {
      queryParams: { 
        email: this.userData.email,
        fromRegister: 'true'  // Para indicar que viene del registro
          }
        });
      },
      error: (error) => {
        this.isLoading = false;
        
        // Manejar errores específicos
        let errorMessage = 'Error al registrar el usuario';
        
        if (error.status === 409) {
          errorMessage = 'El correo electrónico ya está registrado';
        } else if (error.status === 400) {
          if (error.error?.message) {
            errorMessage = error.error.message;
          } else if (error.error?.errors) {
            // Si hay errores de validación específicos
            errorMessage = Object.values(error.error.errors).join(', ');
          }
        } else if (error.status === 500) {
          errorMessage = 'Error del servidor. Por favor intente más tarde';
        }
        
        this.snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }
}