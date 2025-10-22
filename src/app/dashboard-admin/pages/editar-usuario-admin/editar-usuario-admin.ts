import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService, UpdateUserRequest } from '../../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../../material.imports';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

interface Rol {
  id: number;
  nombre: string;
}

@Component({
  selector: 'app-editar-usuario-admin',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterModule,
    MatSlideToggleModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './editar-usuario-admin.html',
  styleUrls: ['./editar-usuario-admin.css']
})
export class EditarUsuarioAdminComponent implements OnInit {
  editUserForm!: FormGroup;
  userId!: number;
  userData: any; // Para mostrar datos actuales no editables
  isLoading = true;
  isSubmitting = false;
  
  roles: Rol[] = [
    { id: 1, nombre: 'Administrador' },
    { id: 2, nombre: 'Tecnico' },
    { id: 3, nombre: 'Usuario' }
  ];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.showError('ID de usuario no encontrado.');
      this.goBack();
      return;
    }
    this.userId = +idParam;

    this.editUserForm = this.fb.group({
      nombres: ['', Validators.required],
      apellidos: ['', Validators.required],
      telefono: ['', [Validators.required, Validators.pattern('[0-9]{10}')]],
      departamento: ['', Validators.required],
      cargo: ['', Validators.required],
      rol_id: [null, Validators.required],
      activo: [true, Validators.required] // Por defecto activo
    });

    this.loadUserData();
  }

  loadUserData(): void {
    this.isLoading = true;
    this.authService.getUserById(this.userId).subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.userData = response.data;
          // Llenar el formulario con los datos obtenidos
          this.editUserForm.patchValue({
            nombres: this.userData.nombres,
            apellidos: this.userData.apellidos,
            telefono: this.userData.telefono,
            departamento: this.userData.departamento,
            cargo: this.userData.cargo,
            rol_id: this.userData.rol_id,
            activo: this.userData.activo
          });
        } else {
          this.showError(response.message || 'No se pudo cargar el usuario.');
          this.goBack();
        }
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error cargando usuario:', err);
        this.showError(err.error?.message || 'Error al cargar datos del usuario.');
        this.goBack();
      }
    });
  }

  onSubmit(): void {
    if (this.editUserForm.invalid) {
      this.editUserForm.markAllAsTouched();
      this.showError('Por favor, complete todos los campos requeridos.');
      return;
    }

    this.isSubmitting = true;
    const updatedData: UpdateUserRequest = this.editUserForm.value;

    this.authService.updateUser(this.userId, updatedData).subscribe({
      next: (response) => {
        this.isSubmitting = false;
        if (response.success) {
          this.showSuccess('Usuario actualizado exitosamente.');
          this.goBack(); // Volver a la lista
        } else {
          this.showError(response.message || 'No se pudo actualizar el usuario.');
        }
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error actualizando usuario:', err);
        this.showError(err.error?.message || 'Error de conexión al actualizar.');
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard-admin/usuarios']);
  }

  // --- Helpers ---
  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 4000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
  }
}