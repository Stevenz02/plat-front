import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

// --- Interfaz Equipo ACTUALIZADA ---
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
    cpu: string | null; // Hacerlos opcionales o nullables si pueden venir vacíos
    ram: string | null;
    storage: string | null;
  } | null; // El objeto especificaciones también podría ser nulo
  estado_id: number;
  ubicacion_id: number;
  usuario_asignado_id: number | null;
  nombre_usuario_asignado?: string | null; // <-- CAMBIO: Añadido (opcional)
  correo_usuario_asignado?: string | null; // <-- CAMBIO: Añadido (opcional)
  fecha_adquisicion: string | null; // Puede ser null
  fecha_garantia?: string | null; // Hacer opcional si no siempre viene
  valor_compra: number | null; // Puede ser null
  proveedor: string | null; // Puede ser null
  observaciones: string | null; // Puede ser null
  fecha_creacion?: string; // Hacer opcional si no siempre viene
  fecha_actualizacion?: string; // Hacer opcional si no siempre viene
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
  message?: string; 
  // Aquí podrías agregar la paginación si tu API la devuelve
}

export interface Marca {
  id: number;
  nombre: string;
}

export interface TipoEquipo {
  id: number;
  nombre: string;
}

export interface EstadoEquipo {
  id: number;
  nombre: string;
}

export interface Ubicacion {
  id: number;
  nombre: string;
}

export interface AsignarUsuarioRequest {
  usuario_nuevo_id: number;
  observaciones?: string;
}

export interface AsignarUsuarioResponse {
  success: boolean;
  message: string;
  data: {
    equipo_id: number;
    nombre_equipo: string;
    usuario_nuevo_id: number;
    nombre_usuario: string; // Nombre del usuario asignado
    fecha_cambio: string;
    observaciones?: string;
  };
}

// Interfaz para la respuesta de la API de usuarios
export interface Usuario {
  id: number;
  email: string;
  nombres: string;
  apellidos: string;
  telefono: string;
  departamento: string;
  cargo: string;
  rol_id: number;
  rol_nombre: string;
  activo: boolean;
  ultimo_acceso: string | null;
  fecha_creacion: string;
  fecha_actualizacion: string;
}

export interface UsuariosListResponse {
  success: boolean;
  data: Usuario[];
}

// --- Interfaz HistorialEquipoEntry ACTUALIZADA ---
export interface HistorialEquipoEntry {
  id: number;
  equipo_id: number;
  tipo_cambio: string;
  estado_anterior_nombre?: string | null; // Nombre del estado anterior
  estado_nuevo_nombre?: string | null;     // Nombre del estado nuevo
  usuario_anterior_nombre?: string | null; // Nombre completo usuario anterior
  usuario_anterior_email?: string | null;  // Email usuario anterior
  usuario_nuevo_nombre?: string | null;    // Nombre completo usuario nuevo
  usuario_nuevo_email?: string | null;     // Email usuario nuevo
  ubicacion_anterior_nombre?: string | null; // Nombre ubicación anterior
  ubicacion_nueva_nombre?: string | null;    // Nombre ubicación nueva
  usuario_responsable_nombre?: string | null; // Nombre completo responsable
  usuario_responsable_email?: string | null;  // Email responsable
  observaciones: string | null; // Aquí puede venir descripción o solución
  fecha_cambio: string;
  ticket_id?: number | null; // Si el backend lo añade para eventos de ticket
  accion_realizada?: string | null;
}

// --- Interfaz HistorialEquipoResponse ---
export interface HistorialEquipoResponse {
  success: boolean;
  data: HistorialEquipoEntry[];
  pagination?: {
    total_items: number;
    items_returned: number;
    limit: number;
    offset: number;
    has_more: boolean;
  };
  filters_applied?: any;
  message?: string;
}

// --- Interfaz para la respuesta de getEquipoById
export interface EquipoDetailResponse {
    success: boolean;
    data: Equipo;
    message?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/api/equipo`;
  private usuariosApiUrl = `${environment.apiUrl}/api/usuarios`; // URL para usuarios
  private historialApiUrl = `${environment.apiUrl}/api/historialEquipo`;

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
  getEquipoById(id: number): Observable<EquipoDetailResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get<EquipoDetailResponse>(`${this.apiUrl}/${id}`, { headers });
  }

  /**
   * Crea un nuevo registro de equipo en el inventario.
   */
  createEquipo(equipoData: CreateEquipoRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post(this.apiUrl, equipoData, { headers });
  }

 // ===== MÉTODOS DE CONSULTA MODIFICADOS (TEMPORALMENTE) =====

  getMarcas(): Observable<{ success: boolean, data: Marca[] }> {
    const mockMarcas: Marca[] = [
      { id: 1, nombre: 'HP' },
      { id: 2, nombre: 'Dell' },
      { id: 3, nombre: 'Lenovo' },
      { id: 4, nombre: 'Canon' },
      { id: 5, nombre: 'Cisco' },
      { id: 6, nombre: 'Otros' }
    ];
    return of({ success: true, data: mockMarcas });
    // return this.http.get<{ success: boolean, data: Marca[] }>(`${this.apiUrl}/marcas?activo=true`, { headers });
  }

  getTiposEquipo(): Observable<{ success: boolean, data: TipoEquipo[] }> {
    const mockTipos: TipoEquipo[] = [
      { id: 1, nombre: 'Computador' },
      { id: 2, nombre: 'Impresora' },
      { id: 3, nombre: 'Monitor' },
      { id: 4, nombre: 'Router/Switch' },
      { id: 5, nombre: 'Teléfono' },
      { id: 6, nombre: 'Otros' }
    ];
    return of({ success: true, data: mockTipos });
    // return this.http.get<{ success: boolean, data: TipoEquipo[] }>(`${this.apiUrl}/tipos-equipo?activo=true`, { headers });
  }

  getEstadosEquipo(): Observable<{ success: boolean, data: EstadoEquipo[] }> {
    const mockEstados: EstadoEquipo[] = [
      { id: 1, nombre: 'Operativo' },
      { id: 2, nombre: 'En Mantenimiento' },
      { id: 3, nombre: 'Dañado' },
      { id: 4, nombre: 'Disponible' }
    ];
    return of({ success: true, data: mockEstados });
    // return this.http.get<{ success: boolean, data: EstadoEquipo[] }>(`${this.apiUrl}/estados-equipo?activo=true`, { headers });
  }

  getUbicaciones(): Observable<{ success: boolean, data: Ubicacion[] }> {
    const mockUbicaciones: Ubicacion[] = [
        { id: 1, nombre: 'Gerencia General' },
        { id: 2, nombre: 'Dirección TIC' },
        { id: 3, nombre: 'Recursos Humanos' },
        { id: 4, nombre: 'Contabilidad' },
        { id: 5, nombre: 'Atención Cliente' },
        { id: 6, nombre: 'Bodega' }
    ];
    return of({ success: true, data: mockUbicaciones });
    // return this.http.get<{ success: boolean, data: Ubicacion[] }>(`${this.apiUrl}/ubicaciones?activo=true`, { headers });
  }

  /**
   * Actualiza la información de un equipo existente.
   */
  updateEquipo(id: number, equipoData: Partial<CreateEquipoRequest>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/${id}`, equipoData, { headers });
  }

  // --- NUEVOS MÉTODOS PARA ASIGNACIÓN ---

  /**
   * Asigna un equipo a un usuario.
   * Llama a: PUT /api/equipo/{id}/asignar-usuario
   */
  asignarUsuario(id: number, data: AsignarUsuarioRequest): Observable<AsignarUsuarioResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put<AsignarUsuarioResponse>(`${this.apiUrl}/${id}/asignar-usuario`, data, { headers });
  }

  /**
   * Obtiene una lista de usuarios activos para asignarles equipos.
   * Llama a: GET /api/usuarios?activo=true
   */
  getUsuariosActivos(): Observable<UsuariosListResponse> {
    const headers = this.authService.getAuthHeaders();
    const params = new HttpParams().set('activo', 'true').set('limit', '500'); // Obtener hasta 500 usuarios activos
    return this.http.get<UsuariosListResponse>(this.usuariosApiUrl, { headers, params });
  }

  // --- NUEVO MÉTODO para obtener el historial ---
  /**
   * Obtiene el historial de eventos para un equipo específico.
   * Llama a: GET /api/historialEquipo/{id}/historial
   * @param equipoId El ID del equipo.
   * @param filters Filtros opcionales (tipo_cambio, fecha_desde, etc.)
   */
  getHistorialEquipo(equipoId: number, filters: any = {}): Observable<HistorialEquipoResponse> {
    const headers = this.authService.getAuthHeaders();
    let params = new HttpParams();
    // Añadir filtros opcionales a los parámetros
    Object.keys(filters).forEach(key => {
      if (filters[key] !== null && filters[key] !== undefined) {
        params = params.set(key, filters[key].toString());
      }
    });

    return this.http.get<HistorialEquipoResponse>(`${this.historialApiUrl}/${equipoId}/historial`, { headers, params });
  }
}
