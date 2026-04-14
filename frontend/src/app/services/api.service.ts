import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Camioneta {
  id: number;
  nombre: string;
  placa?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  color?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface ChecklistItem {
  id: number;
  nombre: string;
  descripcion?: string;
  orden: number;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface Reserva {
  id: number;
  user_id: number;
  camioneta_id: number;
  fecha: string;
  hora_inicio: string;
  hora_fin: string;
  estado: 'pendiente' | 'confirmada' | 'cancelada' | 'completada';
  notas?: string;
  user?: Usuario;
  camioneta?: Camioneta;
  created_at?: string;
  updated_at?: string;
}

export interface UsoChecklistRespuesta {
  id?: number;
  uso_camioneta_id?: number;
  checklist_item_id: number;
  respuesta: boolean;
  foto?: string;
  comentario?: string;
  checklist_item?: ChecklistItem;
}

export interface UsoCamioneta {
  id: number;
  user_id: number;
  camioneta_id: number;
  reserva_id?: number;
  hora_inicio: string;
  hora_fin?: string;
  estado: 'en_uso' | 'finalizado';
  observaciones?: string;
  user?: Usuario;
  camioneta?: Camioneta;
  reserva?: Reserva;
  checklist_respuestas?: UsoChecklistRespuesta[];
  created_at?: string;
  updated_at?: string;
}

export interface Role {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  permisos: {
    reserva_camioneta?: boolean;
    uso_camioneta?: boolean;
    configuracion?: boolean;
    gestion_usuarios?: boolean;
    auditoria?: boolean;
    ver_todo?: boolean;
  };
}

export interface Usuario {
  id: number;
  name: string;
  email: string;
  activo?: boolean | null;
  microsoft_id?: string;
  avatar?: string;
  role_id?: number;
  role?: Role;
  created_at?: string;
  updated_at?: string;
}

export interface Audit {
  id: number;
  user_type?: string;
  user_id?: number;
  event: string;
  auditable_type: string;
  auditable_id: number;
  old_values?: any;
  new_values?: any;
  url?: string;
  ip_address?: string;
  user_agent?: string;
  tags?: string;
  user?: Usuario;
  created_at?: string;
  updated_at?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  // ========== CAMIONETAS ==========
  getCamionetas(): Observable<ApiResponse<Camioneta[]>> {
    return this.http.get<ApiResponse<Camioneta[]>>(`${this.apiUrl}/camionetas`);
  }

  getCamionetasActivas(): Observable<ApiResponse<Camioneta[]>> {
    return this.http.get<ApiResponse<Camioneta[]>>(
      `${this.apiUrl}/opciones/camionetas`,
    );
  }

  getCamioneta(id: number): Observable<ApiResponse<Camioneta>> {
    return this.http.get<ApiResponse<Camioneta>>(
      `${this.apiUrl}/camionetas/${id}`,
    );
  }

  createCamioneta(
    data: Partial<Camioneta>,
  ): Observable<ApiResponse<Camioneta>> {
    return this.http.post<ApiResponse<Camioneta>>(
      `${this.apiUrl}/camionetas`,
      data,
    );
  }

  updateCamioneta(
    id: number,
    data: Partial<Camioneta>,
  ): Observable<ApiResponse<Camioneta>> {
    return this.http.put<ApiResponse<Camioneta>>(
      `${this.apiUrl}/camionetas/${id}`,
      data,
    );
  }

  deleteCamioneta(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/camionetas/${id}`,
    );
  }

  // ========== CHECKLIST ITEMS ==========
  getChecklistItems(): Observable<ApiResponse<ChecklistItem[]>> {
    return this.http.get<ApiResponse<ChecklistItem[]>>(
      `${this.apiUrl}/checklist-items`,
    );
  }

  getChecklistItemsActivos(): Observable<ApiResponse<ChecklistItem[]>> {
    return this.http.get<ApiResponse<ChecklistItem[]>>(
      `${this.apiUrl}/opciones/checklist-items`,
    );
  }

  getChecklistItem(id: number): Observable<ApiResponse<ChecklistItem>> {
    return this.http.get<ApiResponse<ChecklistItem>>(
      `${this.apiUrl}/checklist-items/${id}`,
    );
  }

  createChecklistItem(
    data: Partial<ChecklistItem>,
  ): Observable<ApiResponse<ChecklistItem>> {
    return this.http.post<ApiResponse<ChecklistItem>>(
      `${this.apiUrl}/checklist-items`,
      data,
    );
  }

  updateChecklistItem(
    id: number,
    data: Partial<ChecklistItem>,
  ): Observable<ApiResponse<ChecklistItem>> {
    return this.http.put<ApiResponse<ChecklistItem>>(
      `${this.apiUrl}/checklist-items/${id}`,
      data,
    );
  }

  deleteChecklistItem(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/checklist-items/${id}`,
    );
  }

  // ========== RESERVAS ==========
  getReservas(filters?: any): Observable<ApiResponse<Reserva[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<Reserva[]>>(`${this.apiUrl}/reservas`, {
      params,
    });
  }

  getSlotsOcupados(
    camionetaId: number,
    fechaInicio: string,
    fechaFin: string,
  ): Observable<ApiResponse<Reserva[]>> {
    const params = new HttpParams()
      .set('camioneta_id', camionetaId.toString())
      .set('fecha_inicio', fechaInicio)
      .set('fecha_fin', fechaFin);
    return this.http.get<ApiResponse<Reserva[]>>(
      `${this.apiUrl}/reservas-slots/ocupados`,
      { params },
    );
  }

  getReserva(id: number): Observable<ApiResponse<Reserva>> {
    return this.http.get<ApiResponse<Reserva>>(`${this.apiUrl}/reservas/${id}`);
  }

  createReserva(data: Partial<Reserva>): Observable<ApiResponse<Reserva>> {
    return this.http.post<ApiResponse<Reserva>>(
      `${this.apiUrl}/reservas`,
      data,
    );
  }

  updateReserva(
    id: number,
    data: Partial<Reserva>,
  ): Observable<ApiResponse<Reserva>> {
    return this.http.put<ApiResponse<Reserva>>(
      `${this.apiUrl}/reservas/${id}`,
      data,
    );
  }

  deleteReserva(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/reservas/${id}`);
  }

  // ========== USO DE CAMIONETA ==========
  getUsosCamioneta(filters?: any): Observable<ApiResponse<UsoCamioneta[]>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<UsoCamioneta[]>>(
      `${this.apiUrl}/usos-camioneta`,
      { params },
    );
  }

  getUsoCamioneta(id: number): Observable<ApiResponse<UsoCamioneta>> {
    return this.http.get<ApiResponse<UsoCamioneta>>(
      `${this.apiUrl}/usos-camioneta/${id}`,
    );
  }

  createUsoCamioneta(data: any): Observable<ApiResponse<UsoCamioneta>> {
    return this.http.post<ApiResponse<UsoCamioneta>>(
      `${this.apiUrl}/usos-camioneta`,
      data,
    );
  }

  createUsoCamionetaConFotos(
    formData: FormData,
  ): Observable<ApiResponse<UsoCamioneta>> {
    return this.http.post<ApiResponse<UsoCamioneta>>(
      `${this.apiUrl}/usos-camioneta`,
      formData,
    );
  }

  updateUsoCamioneta(
    id: number,
    data: any,
  ): Observable<ApiResponse<UsoCamioneta>> {
    return this.http.put<ApiResponse<UsoCamioneta>>(
      `${this.apiUrl}/usos-camioneta/${id}`,
      data,
    );
  }

  finalizarUsoCamioneta(id: number): Observable<ApiResponse<UsoCamioneta>> {
    return this.http.post<ApiResponse<UsoCamioneta>>(
      `${this.apiUrl}/usos-camioneta/${id}/finalizar`,
      {},
    );
  }

  subirFotoChecklist(
    usoId: number,
    respuestaId: number,
    foto: File,
  ): Observable<ApiResponse<any>> {
    const formData = new FormData();
    formData.append('foto', foto);
    return this.http.post<ApiResponse<any>>(
      `${this.apiUrl}/usos-camioneta/${usoId}/checklist/${respuestaId}/foto`,
      formData,
    );
  }

  deleteUsoCamioneta(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/usos-camioneta/${id}`,
    );
  }

  // ========== USUARIOS ==========
  getUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios`);
  }

  getUsuariosActivos(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(
      `${this.apiUrl}/opciones/usuarios`,
    );
  }

  getUsuario(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuarios/${id}`);
  }

  createUsuario(data: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(
      `${this.apiUrl}/usuarios`,
      data,
    );
  }

  updateUsuario(
    id: number,
    data: Partial<Usuario>,
  ): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(
      `${this.apiUrl}/usuarios/${id}`,
      data,
    );
  }

  deleteUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}`);
  }

  // ========== ROLES ==========
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`);
  }

  getRole(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.apiUrl}/roles/${id}`);
  }

  // ========== AUDITORÃA ==========
  getAuditorias(
    filters?: any,
  ): Observable<ApiResponse<PaginatedResponse<Audit>>> {
    let params = new HttpParams();
    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (filters[key] !== undefined && filters[key] !== null) {
          params = params.set(key, filters[key].toString());
        }
      });
    }
    return this.http.get<ApiResponse<PaginatedResponse<Audit>>>(
      `${this.apiUrl}/auditoria`,
      { params },
    );
  }

  getAuditoria(id: number): Observable<ApiResponse<Audit>> {
    return this.http.get<ApiResponse<Audit>>(`${this.apiUrl}/auditoria/${id}`);
  }
}
