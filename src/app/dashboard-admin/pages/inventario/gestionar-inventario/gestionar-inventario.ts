import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core'; // <--- AfterViewInit añadido
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { InventoryService, Equipo, EstadoEquipo } from '../../../../services/inventory.service'; // <--- EstadoEquipo importado
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-gestionar-inventario',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './gestionar-inventario.html',
  styleUrls: ['./gestionar-inventario.css']
})
export class GestionarInventarioComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['codigo_inventario', 'nombre', 'descripcion', 'estado', 'usuario_asignado', 'acciones'];
  dataSource = new MatTableDataSource<Equipo>();
  isLoading = true;

  // --- NUEVO: Variable para guardar los estados ---
  estadosEquipo: EstadoEquipo[] = [];

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private inventoryService: InventoryService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadInitialData(); // Llamar a un método que cargue todo
  }

  // --- NUEVO: Cargar equipos y estados ---
  loadInitialData(): void {
    this.isLoading = true;
    // Usamos forkJoin si necesitamos cargar varias cosas, pero aquí basta con encadenar
    this.inventoryService.getEstadosEquipo().pipe(
      map(res => res.success ? res.data : [])
    ).subscribe(estados => {
      this.estadosEquipo = estados;
      this.loadEquipos(); // Cargar equipos una vez que tenemos los estados
    }, error => {
      console.error('Error al cargar estados de equipo:', error);
      this.showError('No se pudieron cargar los tipos de estado.');
      this.loadEquipos(); // Intentar cargar equipos igualmente
    });
  }


  loadEquipos(): void {
    // isLoading ya está en true desde loadInitialData si se llama desde ahí
    this.inventoryService.getEquipos().subscribe({
      next: (response) => {
        if (response.success && response.data) {
          this.dataSource.data = response.data;
        } else {
          this.showError(response.message || 'No se pudieron cargar los datos del inventario.');
          this.dataSource.data = []; // Asegurar que la tabla esté vacía si hay error
        }
        this.isLoading = false; // Mover isLoading = false aquí
      },
      error: (err) => {
        console.error('Error al cargar el inventario:', err);
        this.showError('Error de conexión. No se pudo cargar el inventario.');
        this.dataSource.data = []; // Asegurar tabla vacía
        this.isLoading = false; // Asegurar que isLoading se ponga en false
      }
    });
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    // --- NUEVO: Filtro personalizado que incluya el nombre del estado ---
    this.dataSource.filterPredicate = (data: Equipo, filter: string) => {
      const estadoNombre = this.getEstadoNombre(data.estado_id).toLowerCase();
      const dataStr = (
        data.codigo_inventario +
        data.nombre +
        data.descripcion +
        estadoNombre + // Incluir estado en la búsqueda
        (data.nombre_usuario_asignado || '')
      ).toLowerCase();
      return dataStr.includes(filter);
    };
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  // --- NUEVO: Función para obtener el nombre del estado ---
  getEstadoNombre(estadoId: number | null): string {
    if (estadoId === null || estadoId === undefined) {
      return 'Desconocido';
    }
    const estado = this.estadosEquipo.find(e => e.id === estadoId);
    return estado ? estado.nombre : 'Desconocido';
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

  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}