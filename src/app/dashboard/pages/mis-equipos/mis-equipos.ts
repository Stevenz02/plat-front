import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router'; // Importar RouterModule
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../material.imports'; // Importaciones de Material
import { InventoryService, Equipo } from '../../../services/inventory.service'; // Servicio y modelo

@Component({
  selector: 'app-mis-equipos',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS], // Añadir RouterModule
  templateUrl: './mis-equipos.html',
  styleUrls: ['./mis-equipos.css']
})
export class MisEquiposComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['codigo_inventario', 'nombre', 'modelo', 'numero_serie', 'acciones']; // Columnas para el usuario
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
    this.loadMisEquipos();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadMisEquipos(): void {
    this.isLoading = true;
    // El backend filtra automáticamente por el usuario autenticado
    this.inventoryService.getEquipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data;
        } else {
          this.showError(response.message || 'No se pudieron cargar tus equipos asignados.');
          this.dataSource.data = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar mis equipos:', err);
        this.showError('Error de conexión. No se pudieron cargar tus equipos.');
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

  // APLICAR FILTRO (opcional pero útil)
  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // NAVEGAR AL DETALLE
  verDetalleUsuario(id: number): void {
    this.router.navigate(['/dashboard/inventario', id]);
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}