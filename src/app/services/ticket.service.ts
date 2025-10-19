import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';

export interface CreateTicketRequest {
  titulo: string;
  descripcion: string;
}

export interface Ticket {
  id: number;
  numero_ticket: string;
  titulo: string;
  descripcion: string;
  categoria: string | null;
  prioridad: string | null;
  prioridad_nivel: number | null; 
  prioridad_color: string | null;
  estado: string;
  estado_color: string; 
  usuario_solicitante: string;
  usuario_email: string;
  tecnico_asignado: string | null;
  tecnico_email: string | null;
  equipo_afectado: string | null;
  fecha_creacion: string;
  fecha_asignacion: string | null;
  fecha_resolucion: string | null;
  fecha_cierre: string | null;
  horas_transcurridas: number;
  es_urgente: boolean;
  puede_editar: boolean;
  puede_cerrar: boolean;
}

export interface TicketResponse {
  success: boolean;
  message: string;
  data: {
    ticket: Ticket;
    siguiente_paso: string;
  };
}

export interface TicketsListResponse {
  success: boolean;
  message: string;
  data: {
    tickets: Ticket[];
    pagination: {
      current_page: number;
      total_pages: number;
      total_items: number;
      items_per_page: number;
      has_next: boolean;
      has_prev: boolean;
    };
    estadisticas: {
      total_tickets: number;
      pendientes: number;
      en_progreso: number;
      resueltos: number;
      cerrados: number;
    };
    filters_applied: {
      rol: string;
      estado_id: number | null;
      categoria_id: number | null;
      prioridad_id: number | null;
      fecha_desde: string | null;
      fecha_hasta: string | null;
    };
  };
}

// Interfaz para el historial de cambios
export interface TicketHistoryEvent {
  accion: string;
  descripcion: string;
  comentario: string;
  fecha_cambio: string;
  fecha_cambio_formateada: string;
  usuario_nombre: string;
  usuario_email: string;
}

// Interfaz para la vista completa del ticket (Admin/Técnico)
export interface TicketDetailAdmin {
  ticket: Ticket; // Reutilizamos la interfaz base que ya tenemos
  historial: TicketHistoryEvent[];
  // Añadimos aquí los otros campos que devuelve la API para la vista completa
  permisos_usuario: {
    puede_editar: boolean;
    puede_cambiar_estado: boolean;
    puede_asignar: boolean;
    puede_comentar: boolean;
    puede_ver_historial: boolean;
  };
  siguiente_accion?: string;
}

// Detalle ticket usuario 
export interface TicketDetailUsuario {
  numero_ticket: string;
  titulo: string;
  descripcion: string;
  categoria: string | null;
  usuario_solicitante: string;
  tecnico_asignado: string | null;
  fecha_creacion: string;
  fecha_asignacion: string | null;
  fecha_resolucion: string | null;
  estado: string;
  estado_color: string;
}

export interface AssignTicketRequest {
  tecnico_id: number;
  categoria_id: number;
  prioridad_id: number;
  equipo_afectado_id?: number;
  comentario_asignacion?: string;
}

export interface ChangeStatusRequest {
  nuevo_estado_id: number;
  comentario_tecnico?: string;
  motivo_cambio?: string;
}

export interface Technician {
  id: number;
  nombres: string;
  apellidos: string;   
  email: string;
  especialidad?: string;
  activo: boolean;
}

export interface Equipment {
  id: number;
  nombre: string;
  codigo: string;
  ubicacion?: string;
  activo: boolean;
}

// Categorías
export interface Category {
  id: number;
  nombre: string;
  descripcion: string;
  activo: boolean;
  fecha_creacion: string;
}
export interface CategoriesResponse {
  success: boolean;
  data: Category[];
}
export interface CategoryResponse {
    success: boolean;
    data: Category;
}

// Estados de Ticket
export interface TicketState {
  id: number;
  nombre: string;
  descripcion: string;
  es_final: boolean;
  orden: number;
  activo: boolean;
}

export interface TicketStatesResponse {
  success: boolean;
  data: TicketState[];
}
export interface TicketStateResponse {
    success: boolean;
    data: TicketState;
}

// Prioridades
export interface Priority {
  id: number;
  nombre: string;
  nivel: number;
  color: string;
  descripcion: string;
  activo: boolean;
}

export interface PrioritiesResponse {
  success: boolean;
  message: string;
  data: Priority[];
}

//asociar equipo
export interface AsociarEquipoRequest {
  equipo_id: number;
  descripcion: string; // Descripción del motivo o problema
  accion_realizada?: string;
}

export interface AsociarEquipoResponse {
    success: boolean;
    message: string;
    data: {
      ticket_id: number;
      equipo_id: number;
      nombre_equipo: string;
      descripcion: string;
      accion_realizada?: string;
      fecha_registro: string;
    };
}

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

    // ========== CATEGORÍAS ==========

  // Obtener todas las categorías disponibles
  getCategories(activo: boolean = true): Observable<CategoriesResponse> {
    const headers = this.authService.getAuthHeaders();
    
    const params: any = {};
    
    if (activo !== undefined) {
      params.activo = activo.toString();
    }

    return this.http.get<CategoriesResponse>(`${this.apiUrl}/api/categoria`, { 
      headers, 
      params 
    });
  }

  // Obtener una categoría específica por ID
  getCategoryById(categoryId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/categoria/${categoryId}`, { headers });
  }

  // Método auxiliar para obtener solo categorías activas
  getActiveCategories(): Observable<Category[]> {
    return this.getCategories(true).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.sort((a, b) => a.nombre.localeCompare(b.nombre));
        }
        return [];
      })
    );
  }


  // ========== ESTADOS DE TICKET ==========
  // Obtener todos los estados de ticket
  getTicketStates(activo: boolean = true, es_final?: boolean, limit: number = 50, offset: number = 0): Observable<TicketStatesResponse> {
    const headers = this.authService.getAuthHeaders();
    
    const params: any = {
      limit: limit.toString(),
      offset: offset.toString()
    };
    
    if (activo !== undefined) {
      params.activo = activo.toString();
    }
    
    if (es_final !== undefined) {
      params.es_final = es_final.toString();
    }

    return this.http.get<TicketStatesResponse>(`${this.apiUrl}/api/estados-ticket`, { 
      headers, 
      params 
    });
  }

  // Obtener un estado específico por ID
  getTicketStateById(stateId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/estados-ticket/${stateId}`, { headers });
  }

  // Método auxiliar para obtener solo estados activos
  getActiveTicketStates(): Observable<TicketStatesResponse> {
    return this.getTicketStates(true, undefined, 50, 0);
  }

  // Método auxiliar para obtener estados finales (cerrados/resueltos)
  getFinalTicketStates(): Observable<TicketState[]> {
    return this.getTicketStates(true, true).pipe(
      map(response => {
        if (response.success && response.data) {
          return response.data.sort((a, b) => a.orden - b.orden);
        }
        return [];
      })
    );
  }

  // Obtener todas las prioridades disponibles
  getPriorities(activo: boolean = true, limit: number = 10, offset: number = 0): Observable<PrioritiesResponse> {
    const headers = this.authService.getAuthHeaders();
    
    const params: any = {
      limit: limit.toString(),
      offset: offset.toString()
    };
    
    // Solo agregar el filtro activo si se especifica
    if (activo !== undefined) {
      params.activo = activo.toString();
    }

    return this.http.get<PrioritiesResponse>(`${this.apiUrl}/api/prioridades`, { 
      headers, 
      params 
    });
  }

  // Obtener una prioridad específica por ID
  getPriorityById(priorityId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/prioridades/${priorityId}`, { headers });
  }

  // Método auxiliar para obtener solo prioridades activas (más común)
  getActivePriorities(): Observable<PrioritiesResponse> {
    return this.getPriorities(true, 50, 0); // Obtener hasta 50 prioridades activas
  }

  // Método auxiliar para obtener prioridades ordenadas por nivel (alta, media, baja)
  getPrioritiesOrderedByLevel(): Observable<Priority[]> {
    return this.getActivePriorities().pipe(
      map(response => {
        if (response.success && response.data) {
          // Ordenar por nivel (asumiendo que nivel más alto = mayor prioridad)
          return response.data.sort((a, b) => b.nivel - a.nivel);
        }
        return [];
      })
    );
  }

  // Método para obtener el color por nivel de prioridad (útil si manejas niveles numéricos)
  getPriorityColorByLevel(nivel: number): string {
    switch (nivel) {
      case 3: return '#f44336'; // Alta - Rojo
      case 2: return '#ff9800'; // Media - Naranja  
      case 1: return '#4caf50'; // Baja - Verde
      default: return '#757575'; // Gris por defecto
    }
  }

  /**
   * Asocia un equipo del inventario a un ticket existente.
   * Llama a: POST /api/tickets/{id}/asignar-equipo
   */
  asociarEquipo(ticketId: number, data: AsociarEquipoRequest): Observable<AsociarEquipoResponse> {
    const headers = this.authService.getAuthHeaders();
    return this.http.post<AsociarEquipoResponse>(`${this.apiUrl}/api/tickets/${ticketId}/asignar-equipo`, data, { headers });
  }

  // Crear un nuevo ticket
  createTicket(ticketData: CreateTicketRequest): Observable<TicketResponse> {
    const headers = this.authService.getAuthHeaders();
    const requestData = {
      titulo: ticketData.titulo,
      descripcion: ticketData.descripcion,
    };

    return this.http.post<TicketResponse>(`${this.apiUrl}/api/tickets`, requestData, { headers });
  }

  // Obtener tickets del usuario actual
  getMyTickets(page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
  // Si es admin o técnico, obtener todos los tickets
  if (this.authService.isAdminOrTechnician()) {
    return this.getAllTickets(page, limit);
  }
  
  // Si es usuario final, obtener solo sus tickets
  const headers = this.authService.getAuthHeaders();
  const params = {
    page: page.toString(),
    limit: limit.toString()
  };

  return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
    headers, 
    params 
  });
}

  // Obtener un ticket específico por ID
  getTicketById(ticketId: number): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/tickets/${ticketId}`, { headers });
  }

  // Filtrar tickets por estado
  getTicketsByStatus(status: string, page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
    const headers = this.authService.getAuthHeaders();
    
    // Necesitas usar el estado_id según tu BD
    let estado_id: string = '';
    switch (status.toLowerCase()) {
      case 'pendiente': estado_id = '1'; break;
      case 'en progreso': estado_id = '2'; break;
      case 'resuelto': estado_id = '3'; break;
      case 'cerrado': estado_id = '4'; break;
    }
    
    const params = {
      page: page.toString(),
      limit: limit.toString(),
      estado_id: estado_id
    };

    return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
      headers, 
      params 
    });
  }

  // Métodos de utilidad
  getPrioridadColor(prioridad: string | null, prioridadColor?: string | null): string {
    // Si viene el color del backend, usarlo prioritariamente
    if (prioridadColor) {
      return prioridadColor;
    }
    
    // Fallback para compatibilidad (mantener el código existente)
    if (!prioridad) return '#757575';
    
    switch (prioridad.toLowerCase()) {
      case 'alta': return '#f44336';
      case 'media': return '#ff9800'; 
      case 'baja': return '#4caf50';
      default: return '#757575';
    }
  }

  // ========== MÉTODOS AUXILIARES MEJORADOS ==========

  // Actualizar el método getEstadoColor para usar datos reales
  getEstadoColor(estado: string, estadoColor?: string | null): string {
    // Si viene el color del backend, usarlo prioritariamente
    if (estadoColor) {
      return estadoColor;
    }
    
    // Fallback mejorado basado en los estados reales
    switch (estado.toLowerCase()) {
      case 'pendiente': return '#FFA500';
      case 'en progreso': return '#2196f3';
      case 'resuelto': return '#4caf50';
      case 'cerrado': return '#9e9e9e';
      default: return '#757575';
    }
  }

  // Determinar si un estado es final
  isStateClosedOrResolved(estadoNombre: string): boolean {
    const finalStates = ['cerrado', 'resuelto'];
    return finalStates.includes(estadoNombre.toLowerCase());
  }

  // Obtener el siguiente estado lógico (útil para workflows)
  getNextLogicalState(currentStateId: number, states: TicketState[]): TicketState | null {
    const currentState = states.find(s => s.id === currentStateId);
    if (!currentState) return null;
    
    // Lógica simple: siguiente por orden
    const nextState = states
      .filter(s => s.orden > currentState.orden && s.activo)
      .sort((a, b) => a.orden - b.orden)[0];
      
    return nextState || null;
  }

  formatFecha(fecha: string): string {
    if (!fecha) return 'N/A';
    
    const date = new Date(fecha);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

    // Obtener TODOS los tickets (para administrador/técnico)
  getAllTickets(page: number = 1, limit: number = 10, filters?: any): Observable<TicketsListResponse> {
    const headers = this.authService.getAuthHeaders();
    let params: any = {
      page: page.toString(),
      limit: limit.toString()
    };

    // Agregar filtros opcionales
    if (filters) {
      if (filters.estado_id) params.estado_id = filters.estado_id;
      if (filters.categoria_id) params.categoria_id = filters.categoria_id;
      if (filters.prioridad_id) params.prioridad_id = filters.prioridad_id;
      if (filters.fecha_desde) params.fecha_desde = filters.fecha_desde;
      if (filters.fecha_hasta) params.fecha_hasta = filters.fecha_hasta;
    }

    return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
      headers, 
      params 
    });
  }

  // Cambiar estado de un ticket
  changeTicketStatus(ticketId: number, data: ChangeStatusRequest): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    // Simplemente pasamos el objeto 'data' completo que el componente nos envía.
    return this.http.patch(`${this.apiUrl}/api/tickets/${ticketId}/estado`, data, { headers });
  }

  // Asignar ticket a técnico
  assignTicket(ticketId: number, assignmentData: {
    tecnico_id: number;
    categoria_id: number;
    prioridad_id: number;
    equipo_afectado_id?: number;
    comentario_asignacion?: string;
  }): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    return this.http.patch(`${this.apiUrl}/api/tickets/${ticketId}/asignar`, assignmentData, { headers });
  }

  // Obtener técnicos disponibles - USANDO ENDPOINT REAL
  getTechnicians(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    
    const params = { 
      rol_id: '2',        // Técnicos tienen rol_id = 2
      activo: 'true',     // Solo técnicos activos
      limit: '50'         // Límite suficiente
    };
    
    return this.http.get(`${this.apiUrl}/api/usuarios`, { headers, params });
  }

  // Estados para administrador (incluye más opciones)
  getEstadosParaAdmin() {
    return [
      { id: 1, nombre: 'Pendiente', color: '#FFA500' },
      { id: 2, nombre: 'En Progreso', color: '#2196f3' },
      { id: 3, nombre: 'Resuelto', color: '#4caf50' },
      { id: 4, nombre: 'Cerrado', color: '#9e9e9e' }
    ];
  }

  // Determinar si el usuario puede gestionar tickets
  canManageTickets(): boolean {
    return this.authService.isAdminOrTechnician();
  }

  /**
   * Obtiene los detalles completos de un ticket para la vista de Admin/Técnico.
   * @param ticketId El ID del ticket a consultar.
   * @returns Un Observable con los detalles completos del ticket.
   */
  getTicketDetailForAdmin(ticketId: number): Observable<TicketDetailAdmin> {
    return this.getTicketById(ticketId).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Error al obtener los detalles completos del ticket');
        }
        // La API ya nos da la estructura que necesitamos, así que la devolvemos directamente
        return response.data as TicketDetailAdmin;
      })
    );
  }

  /**
   * Obtiene los detalles completos de un ticket y los transforma
   * a una vista simplificada para el usuario final.
   * @param ticketId El ID del ticket a consultar.
   * @returns Un Observable con los detalles básicos del ticket.
   */
  getTicketDetailForUser(ticketId: number): Observable<TicketDetailUsuario> {
    // Reutilizamos el método que ya obtiene toda la información
    return this.getTicketById(ticketId).pipe(
      map(response => {
        if (!response.success) {
          // Si la API devuelve un error, lanzamos una excepción para que el componente lo sepa
          throw new Error(response.message || 'Error al obtener el ticket');
        }

        // Extraemos el ticket completo
        const fullTicket = response.data.ticket;

        // Creamos y devolvemos el nuevo objeto con solo los campos necesarios
        const userTicketView: TicketDetailUsuario = {
          numero_ticket: fullTicket.numero_ticket,
          titulo: fullTicket.titulo,
          descripcion: fullTicket.descripcion,
          categoria: fullTicket.categoria,
          usuario_solicitante: fullTicket.usuario_solicitante,
          tecnico_asignado: fullTicket.tecnico_asignado,
          fecha_creacion: fullTicket.fecha_creacion,
          fecha_asignacion: fullTicket.fecha_asignacion,
          fecha_resolucion: fullTicket.fecha_resolucion,
          estado: fullTicket.estado,
          estado_color: fullTicket.estado_color
        };
        
        return userTicketView;
      })
    );
  }
}