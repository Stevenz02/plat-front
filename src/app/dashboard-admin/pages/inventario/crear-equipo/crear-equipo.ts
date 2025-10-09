import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatSnackBar } from '@angular/material/snack-bar';

import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { Observable, forkJoin, map } from 'rxjs'; // Importar forkJoin y map
import { InventoryService, CreateEquipoRequest, Marca, TipoEquipo, EstadoEquipo, Ubicacion } from '../../../../services/inventory.service';

@Component({
  selector: 'app-crear-equipo',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ...MATERIAL_IMPORTS
  ],
  templateUrl: './crear-equipo.html',
  styleUrls: ['./crear-equipo.css']
})
export class CrearEquipoComponent implements OnInit {
  equipoForm!: FormGroup;
  isSubmitting = false;

  marcas$!: Observable<Marca[]>;
  tiposEquipo$!: Observable<TipoEquipo[]>;
  estadosEquipo$!: Observable<EstadoEquipo[]>;
  ubicaciones$!: Observable<Ubicacion[]>;

  constructor(
    private fb: FormBuilder,
    private inventoryService: InventoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadDropdownData(); // Cargar datos para los selects
    this.equipoForm = this.fb.group({
      // Campos Principales
      codigo_inventario: ['', [Validators.required, Validators.maxLength(50)]],
      nombre: ['', [Validators.required, Validators.maxLength(100)]],
      modelo: ['', [Validators.required, Validators.maxLength(100)]],
      numero_serie: ['', [Validators.required, Validators.maxLength(100)]],
      descripcion: [''],
      observaciones: [''],

      tipo_equipo_id: [null, Validators.required],
      marca_id: [null, Validators.required],
      estado_id: [null, Validators.required],
      ubicacion_id: [null, Validators.required],

      // Grupo anidado para especificaciones
      especificaciones: this.fb.group({
        cpu: ['', Validators.maxLength(50)],
        ram: ['', Validators.maxLength(50)],
        storage: ['', Validators.maxLength(50)]
      }),

      // Campos de adquisición (opcionales por ahora)
      fecha_adquisicion: [null],
      valor_compra: [null, [Validators.min(0)]],
      proveedor: ['', Validators.maxLength(100)]
    });
  }

    // NUEVO MÉTODO para cargar los datos
  loadDropdownData(): void {
    this.marcas$ = this.inventoryService.getMarcas().pipe(map(res => res.data));
    this.tiposEquipo$ = this.inventoryService.getTiposEquipo().pipe(map(res => res.data));
    this.estadosEquipo$ = this.inventoryService.getEstadosEquipo().pipe(map(res => res.data));
    this.ubicaciones$ = this.inventoryService.getUbicaciones().pipe(map(res => res.data));
  }

  onSubmit(): void {
    if (this.equipoForm.invalid) {
      this.equipoForm.markAllAsTouched();
      this.showError('Por favor, complete todos los campos obligatorios.');
      return;
    }

    this.isSubmitting = true;
    const formData = this.equipoForm.value as CreateEquipoRequest;

    this.inventoryService.createEquipo(formData).subscribe({
      next: (response) => {
        this.showSuccess(response.message || 'Equipo registrado exitosamente');
        this.router.navigate(['/dashboard-admin/inventario/gestionar']);
      },
      error: (err) => {
        this.isSubmitting = false;
        console.error('Error al crear el equipo:', err);
        this.showError(err.error?.message || 'No se pudo registrar el equipo.');
      }
    });
  }

  goBack(): void {
    if (this.equipoForm.dirty) {
      if (confirm('¿Estás seguro de que quieres salir? Se perderán los cambios no guardados.')) {
        this.router.navigate(['/dashboard-admin/inventario/gestionar']);
      }
    } else {
      this.router.navigate(['/dashboard-admin/inventario/gestionar']);
    }
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 6000,
      panelClass: ['error-snackbar']
    });
  }
}