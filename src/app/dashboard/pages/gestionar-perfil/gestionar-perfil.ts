// src/app/dashboard/pages/gestionar-perfil/gestionar-perfil.ts
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, UpdateUserRequest } from '../../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../../material.imports';
// Importa un componente de diálogo de confirmación (si no existe, créalo)
// import { ConfirmationDialogComponent } from '../../../shared/dialogs/confirmation-dialog/confirmation-dialog.component';

@Component({
  selector: 'app-gestionar-perfil',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './gestionar-perfil.html',
  styleUrls: ['./gestionar-perfil.css']
})
export class GestionarPerfilComponent implements OnInit {
  profileForm!: FormGroup;
  currentUser: any;
  isLoading = false;
  isDeactivating = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private snackBar: MatSnackBar,
    private router: Router,
    private dialog: MatDialog // Para confirmación
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUser();
    if (!this.currentUser) {
      this.snackBar.open('Error al cargar datos del usuario.', 'Cerrar', { duration: 5000 });
      this.authService.logoutLocal();
      return;
    }

    this.profileForm = this.fb.group({
      nombres: [this.currentUser.nombres || '', Validators.required],
      apellidos: [this.currentUser.apellidos || '', Validators.required],
      telefono: [this.currentUser.telefono || '', [Validators.required, Validators.pattern('[0-9]{10}')]],
      departamento: [this.currentUser.departamento || '', Validators.required],
      cargo: [this.currentUser.cargo || '', Validators.required]
    });
  }

  onUpdateProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.showError('Por favor, complete todos los campos requeridos.');
      return;
    }

    this.isLoading = true;
    const updatedData: UpdateUserRequest = this.profileForm.value;

    this.authService.updateUser(this.currentUser.id, updatedData).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.showSuccess('Perfil actualizado exitosamente.');
          // Actualizar datos locales por si acaso
          this.currentUser = this.authService.getCurrentUser();
          this.profileForm.reset(updatedData); // Resetea con los nuevos valores
          this.profileForm.markAsPristine(); // Marcar como no modificado
        } else {
          this.showError(response.message || 'No se pudo actualizar el perfil.');
        }
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error actualizando perfil:', err);
        this.showError(err.error?.message || 'Error de conexión al actualizar.');
      }
    });
  }

  confirmDeactivation(): void {
    // Aquí deberías usar un diálogo de confirmación real
    const confirmation = confirm(
      '¿Estás seguro de que quieres dar de baja tu cuenta? ' +
      'Esta acción no se puede deshacer y no podrás volver a iniciar sesión.'
    );

    if (confirmation) {
      this.deactivateAccount();
    }

    /*
    // Ejemplo con MatDialog (requiere crear ConfirmationDialogComponent)
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      width: '400px',
      data: {
        title: 'Confirmar Baja de Cuenta',
        message: '¿Estás seguro de que quieres dar de baja tu cuenta? Esta acción no se puede deshacer y no podrás volver a iniciar sesión.'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === true) {
        this.deactivateAccount();
      }
    });
    */
  }

  deactivateAccount(): void {
    this.isDeactivating = true;
    this.authService.deactivateAccount(this.currentUser.id).subscribe({
      next: (response) => {
        if (response.success) {
          this.showSuccess('Cuenta dada de baja exitosamente. Cerrando sesión...');
          setTimeout(() => {
            this.authService.logoutLocal(); // Cierra sesión localmente
          }, 2000);
        } else {
          this.isDeactivating = false;
          this.showError(response.message || 'No se pudo dar de baja la cuenta.');
        }
      },
      error: (err) => {
        this.isDeactivating = false;
        console.error('Error al dar de baja:', err);
        this.showError(err.error?.message || 'Error de conexión al dar de baja.');
      }
    });
  }

  resetForm(): void {
    if (this.profileForm.dirty) {
        this.profileForm.reset({
          nombres: this.currentUser.nombres || '',
          apellidos: this.currentUser.apellidos || '',
          telefono: this.currentUser.telefono || '',
          departamento: this.currentUser.departamento || '',
          cargo: this.currentUser.cargo || ''
        });
        this.profileForm.markAsPristine();
    }
}


  // --- Helpers ---
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}