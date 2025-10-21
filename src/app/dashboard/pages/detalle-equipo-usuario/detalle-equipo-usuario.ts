import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router'; // Importar RouterModule
import { CommonModule } from '@angular/common';
import { MATERIAL_IMPORTS } from '../../../material.imports';
// Asegúrate que la interfaz Equipo está actualizada en el servicio
import { InventoryService, Equipo, Marca, TipoEquipo, EstadoEquipo, Ubicacion } from '../../../services/inventory.service';
import { forkJoin } from 'rxjs'; // Necesitamos forkJoin para cargar listas auxiliares

@Component({
  selector: 'app-detalle-equipo-usuario',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS], // Añadir RouterModule
  templateUrl: './detalle-equipo-usuario.html',
  styleUrls: ['./detalle-equipo-usuario.css']
})
export class DetalleEquipoUsuarioComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  public equipo = signal<Equipo | null>(null);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // Necesitamos las listas para mostrar nombres en lugar de IDs
  marcas: Marca[] = [];
  tiposEquipo: TipoEquipo[] = [];
  estadosEquipo: EstadoEquipo[] = [];
  ubicaciones: Ubicacion[] = [];

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadEquipoData(+idParam);
    } else {
      this.error.set('No se proporcionó un ID de equipo.');
      this.isLoading.set(false);
    }
  }

  loadEquipoData(id: number): void {
    this.isLoading.set(true);
    this.error.set(null);

    // Cargamos el equipo y las listas necesarias en paralelo
    forkJoin({
      equipoRes: this.inventoryService.getEquipoById(id),
      marcasRes: this.inventoryService.getMarcas(),
      tiposRes: this.inventoryService.getTiposEquipo(),
      estadosRes: this.inventoryService.getEstadosEquipo(),
      ubicacionesRes: this.inventoryService.getUbicaciones()
    }).subscribe({
      next: ({ equipoRes, marcasRes, tiposRes, estadosRes, ubicacionesRes }) => {
        if (equipoRes.success) {
          this.equipo.set(equipoRes.data);
        } else {
          // Asumimos que si success es false, hay un mensaje
          this.error.set((equipoRes as any).message || 'No se pudo cargar el equipo.');
        }
        // Guardamos las listas
        this.marcas = marcasRes.data;
        this.tiposEquipo = tiposRes.data;
        this.estadosEquipo = estadosRes.data;
        this.ubicaciones = ubicacionesRes.data;

        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos del equipo:', err);
        // El backend debería devolver 403 o 404 si el usuario no tiene permiso
        if (err.status === 403 || err.status === 404) {
          this.error.set('No tienes permiso para ver este equipo o no existe.');
        } else {
          this.error.set(err.error?.message || 'Ocurrió un error al cargar la información.');
        }
        this.isLoading.set(false);
      }
    });
  }

  // Función para obtener nombres (igual que en detalle-equipo.ts)
  getNombreDesdeId(lista: {id: number, nombre: string}[], id: number | null): string {
    if (id === null || id === undefined) return 'N/A';
    const item = lista.find(i => i.id === id);
    return item ? item.nombre : `ID ${id}`;
  }

  goBack(): void {
    this.router.navigate(['/dashboard/inventario']); // Volver a la lista de 'mis equipos'
  }
}