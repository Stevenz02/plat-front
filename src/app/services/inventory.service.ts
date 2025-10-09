import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// INTERFACES BASADAS EN TU API

// Para la respuesta de un solo equipo (GET /api/equipo/{id})
export interface Equipo {
  id: number;
  codigo_inventario: string;
  nombre: string;
  descripcion: string;
  tipo_equipo_id: number;
  marca_id: number;
  modelo: string;
  numero_serie: string;
  especificaciones: {
    cpu: string;
    ram: string;
    storage: string;
  };
  estado_id: number;
  ubicacion_id: number;
  usuario_asignado_id: number | null;
  fecha_adquisicion: string;
  fecha_garantia: string | null;
  valor_compra: number;
  proveedor: string;
  observaciones: string;
  // Podríamos añadir más campos si la API los devuelve (ej. nombre del usuario, etc.)
}

// Para la creación de un equipo (POST /api/equipo)
export interface CreateEquipoRequest {
  codigo_inventario: string;
  nombre: string;
  descripcion: string;
  tipo_equipo_id: number;
  marca_id: number;
  modelo: string;
  numero_serie: string;
  especificaciones: {
    cpu: string;
    ram: string;
    storage: string;
  };
  estado_id: number;
  ubicacion_id: number;
  // Otros campos opcionales que tu API permita
}

// Para la respuesta de una lista de equipos
export interface EquiposListResponse {
  success: boolean;
  data: Equipo[];
  message?: string; // <-- AÑADE ESTA LÍNEA
  // Aquí podrías agregar la paginación si tu API la devuelve
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/equipo`;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

  /**
   * Obtiene una lista de todos los equipos.
   * Acepta filtros opcionales como en tu API.
   */
  getEquipos(filters: any = {}): Observable<EquiposListResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<EquiposListResponse>(this.apiUrl, { headers, params: filters });
  }

  /**
   * Obtiene un equipo específico por su ID.
   */
  getEquipoById(id: number): Observable<{ success: boolean, data: Equipo }> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<{ success: boolean, data: Equipo }>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Crea un nuevo registro de equipo en el inventario.
   */
  createEquipo(equipoData: CreateEquipoRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(this.apiUrl, equipoData, { headers });
  }

  /**
   * Actualiza la información de un equipo existente.
   */
  updateEquipo(id: number, equipoData: Partial<CreateEquipoRequest>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, equipoData, { headers });
  }
}
