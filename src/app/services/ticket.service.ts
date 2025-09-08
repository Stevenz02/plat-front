import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
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
  nombre: string;
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

@Injectable({
  providedIn: 'root'
})
export class TicketService {
  private apiUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) {}

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

  // Actualizar un ticket (para futuras funcionalidades)
  updateTicket(ticketId: number, ticketData: Partial<CreateTicketRequest>): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.put(`${this.apiUrl}/api/tickets/${ticketId}`, ticketData, { headers });
  }

  // Obtener categorías disponibles (para futuro uso)
  getCategories(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/categorias`, { headers });
  }

  // Obtener prioridades disponibles (para futuro uso)
  getPriorities(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/prioridades`, { headers });
  }

  // Obtener equipos disponibles (para futuro uso)
  getEquipment(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/equipos`, { headers });
  }

// Filtrar tickets por estado - CORREGIDO
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

// Buscar tickets - ACTUALIZAR cuando sepas qué parámetro usar para búsqueda
searchTickets(searchTerm: string, page: number = 1, limit: number = 10): Observable<TicketsListResponse> {
  const headers = this.authService.getAuthHeaders();
  const params = {
    page: page.toString(),
    limit: limit.toString(),
    // Necesitarías saber cómo se llama el parámetro de búsqueda en tu API
    // Por ejemplo: 'titulo' o 'buscar' o 'q'
    titulo: searchTerm  // Ajustar según tu API
  };

  return this.http.get<TicketsListResponse>(`${this.apiUrl}/api/tickets`, { 
    headers, 
    params 
  });
}

  // Métodos de utilidad
// Actualizar las firmas para aceptar null
getEstadoColor(estado: string, estadoColor?: string | null): string {
  // Si viene el color del backend, usarlo; si no, usar fallback
  if (estadoColor) {
    return estadoColor;
  }
  
  // Fallback para compatibilidad
  switch (estado.toLowerCase()) {
    case 'pendiente': return '#FFA500';
    case 'en progreso': return '#2196f3';
    case 'resuelto': return '#4caf50';
    case 'cerrado': return '#9e9e9e';
    default: return '#757575';
  }
}

getPrioridadColor(prioridad: string | null, prioridadColor?: string | null): string {
  // Si viene el color del backend, usarlo; si no, usar fallback
  if (prioridadColor) {
    return prioridadColor;
  }
  
  // Fallback para compatibilidad
  if (!prioridad) return '#757575';
  
  switch (prioridad.toLowerCase()) {
    case 'alta': return '#f44336';
    case 'media': return '#ff9800';
    case 'baja': return '#4caf50';
    default: return '#757575';
  }
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

  // Obtener estadísticas básicas de tickets del usuario
  getMyTicketStats(): Observable<any> {
    const headers = this.authService.getAuthHeaders();
    return this.http.get(`${this.apiUrl}/api/tickets/mis-tickets/estadisticas`, { headers });
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
changeTicketStatus(ticketId: number, newStatus: number, comment?: string): Observable<any> {
  const headers = this.authService.getAuthHeaders();
  const body: any = {
    nuevo_estado_id: newStatus
  };
  
  if (comment) {
    body.comentario_tecnico = comment;
    body.motivo_cambio = "Ticket asignado y trabajo iniciado";
  }

  return this.http.patch(`${this.apiUrl}/api/tickets/${ticketId}/estado`, body, { headers });
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

// Obtener equipos para asignación
getEquipmentForAssignment(): Observable<any> {
  const headers = this.authService.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/api/equipos`, { headers });
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

// Obtener estadísticas globales (para admin)
getGlobalTicketStats(): Observable<any> {
  const headers = this.authService.getAuthHeaders();
  return this.http.get(`${this.apiUrl}/api/tickets/estadisticas/globales`, { headers });
}
}