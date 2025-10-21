import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { forkJoin } from 'rxjs';
import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { InventoryService, Equipo, Marca, TipoEquipo, EstadoEquipo, Ubicacion, HistorialEquipoEntry } from '../../../../services/inventory.service';

@Component({
  selector: 'app-detalle-equipo',
  standalone: true,
  imports: [CommonModule, DatePipe, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './detalle-equipo.html',
  styleUrls: ['./detalle-equipo.css']
})
export class DetalleEquipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  public equipo = signal<Equipo | null>(null);
  public historial = signal<HistorialEquipoEntry[]>([]);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Mantenemos solo las listas necesarias para los detalles PRINCIPALES del equipo
  marcas: Marca[] = [];
  tiposEquipo: TipoEquipo[] = [];
  estadosEquipo: EstadoEquipo[] = []; // Necesaria para el estado principal del equipo
  ubicaciones: Ubicacion[] = [];   // Necesaria para la ubicación principal del equipo

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAllData(+id);
    } else {
      this.error.set('No se proporcionó un ID de equipo.');
      this.isLoading.set(false);
    }
  }

  // MÉTODO loadAllData SIMPLIFICADO
  loadAllData(id: number): void {
    this.isLoading.set(true);
    this.historial.set([]);
    this.error.set(null);

    // Ya no necesitamos cargar la lista completa de usuarios
    forkJoin({
      equipoRes: this.inventoryService.getEquipoById(id),
      historialRes: this.inventoryService.getHistorialEquipo(id, { limit: 100 }), // Carga historial
      // Mantenemos las llamadas para mostrar nombres en la sección principal
      marcasRes: this.inventoryService.getMarcas(),
      tiposRes: this.inventoryService.getTiposEquipo(),
      estadosRes: this.inventoryService.getEstadosEquipo(),
      ubicacionesRes: this.inventoryService.getUbicaciones()
    }).subscribe({
      next: ({ equipoRes, historialRes, marcasRes, tiposRes, estadosRes, ubicacionesRes }) => {
        // Asignar datos del equipo
        if (equipoRes.success) {
          this.equipo.set(equipoRes.data);
        } else {
          const errorMessage = (equipoRes as any).message || 'Error al cargar detalles del equipo';
          this.error.set(errorMessage);
          console.error('Error al cargar equipo:', errorMessage);
        }

        // Asignar datos del historial
        if (historialRes.success) {
          this.historial.set(historialRes.data.sort((a, b) => new Date(b.fecha_cambio).getTime() - new Date(a.fecha_cambio).getTime()));
        } else {
           console.warn('No se pudo cargar el historial:', historialRes.message);
           this.historial.set([]);
        }

        // Asignar listas (sin la de usuarios)
        this.marcas = marcasRes.data;
        this.tiposEquipo = tiposRes.data;
        this.estadosEquipo = estadosRes.data; // Mantenida
        this.ubicaciones = ubicacionesRes.data; // Mantenida

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error en forkJoin al cargar datos:', err);
        this.error.set(err.error?.message || 'Ocurrió un error al cargar la información completa.');
        this.isLoading.set(false);
      }
    });
  }

  // Función getNombreDesdeId
  getNombreDesdeId(lista: {id: number, nombre: string}[], id: number | null): string {
    if (id === null || id === undefined) return 'N/A';
    const item = lista.find(i => i.id === id);
    return item ? item.nombre : `ID ${id}`;
  }


  editarEquipo(): void {
    const equipoId = this.equipo()?.id;
    if (equipoId) {
      this.router.navigate(['/dashboard-admin/inventario/editar', equipoId]);
    }
  }

  goBack(): void {
    this.router.navigate(['/dashboard-admin/inventario/gestionar']);
  }
}