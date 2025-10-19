import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { Observable, forkJoin } from 'rxjs';
import { map } from 'rxjs/operators';
import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { InventoryService, Equipo, Usuario, AsignarUsuarioRequest } from '../../../../services/inventory.service';

@Component({
  selector: 'app-asignar-usuario-equipo',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './asignar-usuario-equipo.html',
  styleUrls: ['./asignar-usuario-equipo.css']
})
export class AsignarUsuarioEquipoComponent implements OnInit {
  assignForm!: FormGroup;
  equipo: Equipo | null = null; // Para mostrar detalles del equipo
  usuarios$: Observable<Usuario[]>; // Observable para la lista de usuarios
  equipoId!: number;
  isLoading = true;
  isSubmitting = false;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private snackBar: MatSnackBar,
    private route: ActivatedRoute, // Para leer el ID del equipo de la URL
    private router: Router // Para navegar después de asignar
  ) {
    // Obtenemos la lista de usuarios activos al construir
    this.usuarios$ = this.inventoryService.getUsuariosActivos().pipe(
      map(response => response.success ? response.data : [])
    );
  }

  ngOnInit(): void {
    // Leer el ID del equipo desde los parámetros de la ruta
    const idParam = this.route.snapshot.paramMap.get('id');
    if (!idParam) {
      this.showError('ID de equipo no encontrado en la ruta.');
      this.router.navigate(['/dashboard-admin/inventario/gestionar']); // Redirigir si no hay ID
      return;
    }
    this.equipoId = +idParam; // Convertir a número

    // Inicializar el formulario
    this.assignForm = this.fb.group({
      usuario_nuevo_id: ['', [Validators.required]],
      observaciones: ['']
    });

    // Cargar los detalles del equipo para mostrar información
    this.loadEquipoDetails();
  }

  loadEquipoDetails(): void {
    this.isLoading = true;
    this.inventoryService.getEquipoById(this.equipoId).subscribe({
      next: (response) => {
        if (response.success) {
          this.equipo = response.data;
        } else {
          this.showError('No se pudieron cargar los detalles del equipo.');
          // Considera si quieres redirigir aquí también
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error cargando equipo:', err);
        this.showError('Error al cargar la información del equipo.');
        this.isLoading = false;
        // Redirigir si el equipo no se encuentra
        this.router.navigate(['/dashboard-admin/inventario/gestionar']);
      }
    });
  }

  onSubmit(): void {
    if (this.assignForm.invalid) {
      this.assignForm.markAllAsTouched();
      return;
    }

    this.isSubmitting = true;
    const requestData: AsignarUsuarioRequest = this.assignForm.value;

    this.inventoryService.asignarUsuario(this.equipoId, requestData).subscribe({
      next: (response) => {
        this.snackBar.open(response.message || 'Equipo asignado correctamente.', 'Cerrar', { duration: 5000, panelClass: ['success-snackbar'] });
        // Navegar de vuelta a la lista de inventario después del éxito
        this.router.navigate(['/dashboard-admin/inventario/gestionar']);
      },
      error: (err) => {
        this.isSubmitting = false;
        this.snackBar.open(err.error?.message || 'Error al asignar el equipo.', 'Cerrar', { duration: 6000, panelClass: ['error-snackbar'] });
      }
    });
  }

  // Método para volver a la lista de inventario
  cancel(): void {
    this.router.navigate(['/dashboard-admin/inventario/gestionar']);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}
