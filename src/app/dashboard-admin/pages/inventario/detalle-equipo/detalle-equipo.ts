import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { forkJoin } from 'rxjs'; // Importar forkJoin
import { MATERIAL_IMPORTS } from '../../../../material.imports';
import { InventoryService, Equipo, Marca, TipoEquipo, EstadoEquipo, Ubicacion } from '../../../../services/inventory.service';

@Component({
  selector: 'app-detalle-equipo',
  standalone: true,
  imports: [CommonModule, ...MATERIAL_IMPORTS],
  templateUrl: './detalle-equipo.html',
  styleUrls: ['./detalle-equipo.css']
})
export class DetalleEquipoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private inventoryService = inject(InventoryService);

  public equipo = signal<Equipo | null>(null);
  public isLoading = signal(true);
  public error = signal<string | null>(null);

  // NUEVAS PROPIEDADES PARA GUARDAR LAS LISTAS
  marcas: Marca[] = [];
  tiposEquipo: TipoEquipo[] = [];
  estadosEquipo: EstadoEquipo[] = [];
  ubicaciones: Ubicacion[] = [];

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadAllData(+id); // Cambiamos a un nuevo método
    } else {
      this.error.set('No se proporcionó un ID de equipo.');
      this.isLoading.set(false);
    }
  }

  // MÉTODO ACTUALIZADO PARA CARGAR TODO EN PARALELO
  loadAllData(id: number): void {
    this.isLoading.set(true);
    forkJoin({
      equipoRes: this.inventoryService.getEquipoById(id),
      marcasRes: this.inventoryService.getMarcas(),
      tiposRes: this.inventoryService.getTiposEquipo(),
      estadosRes: this.inventoryService.getEstadosEquipo(),
      ubicacionesRes: this.inventoryService.getUbicaciones()
    }).subscribe({
      next: ({ equipoRes, marcasRes, tiposRes, estadosRes, ubicacionesRes }) => {
        if (equipoRes.success) this.equipo.set(equipoRes.data);
        this.marcas = marcasRes.data;
        this.tiposEquipo = tiposRes.data;
        this.estadosEquipo = estadosRes.data;
        this.ubicaciones = ubicacionesRes.data;
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error al cargar datos:', err);
        this.error.set('Ocurrió un error al cargar la información completa.');
        this.isLoading.set(false);
      }
    });
  }

  // NUEVA FUNCIÓN UTILITARIA para buscar el nombre
  getNombreDesdeId(lista: {id: number, nombre: string}[], id: number): string {
    const item = lista.find(i => i.id === id);
    return item ? item.nombre : `ID Desconocido (${id})`;
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