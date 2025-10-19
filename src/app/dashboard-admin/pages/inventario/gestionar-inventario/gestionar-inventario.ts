import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { InventoryService, Equipo } from '../../../../services/inventory.service';

@Component({
  selector: 'app-gestionar-inventario',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './gestionar-inventario.html',
  styleUrls: ['./gestionar-inventario.css']
})
export class GestionarInventarioComponent implements OnInit {
  // Columnas inspiradas en tu imagen de ESET
  displayedColumns: string[] = ['codigo_inventario', 'nombre', 'descripcion', 'usuario_asignado', 'acciones'];
  dataSource = new MatTableDataSource<Equipo>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadEquipos();
  }

  loadEquipos(): void {
    this.isLoading = true;
    this.inventoryService.getEquipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data;
        } else {
          // AÑADIDO: Mostrar error si la respuesta no es exitosa
          this.showError(response.message || 'No se pudieron cargar los datos del inventario.');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar el inventario:', err);
        // AÑADIDO: Mejor manejo de errores de conexión
        this.showError('Error de conexión. No se pudo cargar el inventario.');
        this.isLoading = false;
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort; // <-- AÑADIDO: Conecta el sort con la tabla
  }

  // AÑADIDO: Método para aplicar el filtro
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  crearEquipo(): void {
    this.router.navigate(['/dashboard-admin/inventario/crear']);
  }

  verDetalle(id: number): void {
    this.router.navigate(['/dashboard-admin/inventario/detalle', id]);
  }

  irAAsignarUsuario(equipo: Equipo): void {
    this.router.navigate(['/dashboard-admin/inventario', equipo.id, 'asignar-usuario']);
  }
  
  // AÑADIDO: Método para mostrar notificaciones de error
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}