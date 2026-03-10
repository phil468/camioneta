import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ImportResult {
  success: boolean;
  message: string;
  imported?: number;
  updated?: number;
  errors?: string[];
}

export interface Cliente {
  id: number;
  codigo?: string;
  nombre: string;
  ruc?: string;
  direccion?: string;
  telefono?: string;
  email?: string;
  activo: boolean;
  representante_activo?: RepresentanteCliente;
  representantes?: RepresentanteCliente[];
}

export interface RepresentanteCliente {
  id: number;
  cliente_id: number;
  nombre: string;
  dni?: string;
  telefono?: string;
  email?: string;
  cargo?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
  cliente?: Cliente;
}

export interface Chofer {
  id: number;
  cliente_id?: number;
  placa_principal_id?: number;
  nombre: string;
  dni: string;
  licencia?: string;
  telefono?: string;
  activo: boolean;
  cliente?: Cliente;
  placaPrincipal?: Placa;
}

export interface Placa {
  id: number;
  numero_placa: string;
  tipo_vehiculo?: string;
  marca?: string;
  modelo?: string;
  anio?: number;
  activo: boolean;
}

export interface DescripcionJaba {
  id: number;
  cliente_id?: number;
  codigo: string;
  descripcion: string;
  color?: string;
  material?: string;
  capacidad?: number;
  activo: boolean;
  cliente?: Cliente;
}

export interface Role {
  id: number;
  nombre: string;
  slug: string;
  descripcion?: string;
  permisos: {
    crear_registro: boolean;
    ver_registros: boolean;
    aprobar_registro: boolean;
    rechazar_registro: boolean;
    adjuntar_guia: boolean;
    configuracion: boolean;
    exportar_excel: boolean;
    generar_pdf: boolean;
    eliminar_registro: boolean;
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

export interface Registro {
  id?: number;
  numero_registro?: string;
  fecha?: string;
  hora?: string;
  cliente_id: number;
  representante_cliente_id?: number;
  // representante_cliente?: string;
  chofer_id: number;
  placa_1_id?: number;
  placa_2_id?: number;
  descripcion_jaba_1_id?: number;
  descripcion_jaba_2_id?: number;
  cantidad_jabas_1: number;
  cantidad_jabas_2?: number;
  cantidad_parihuelas: number;
  observaciones?: string;
  imagen_path?: string;
  firma_entregado?: string;
  firma_representante?: string;
  estado?: 'por_aprobar' | 'aprobado' | 'rechazado';
  motivo_rechazo?: string;
  guia_remision?: string;
  pdf_path?: string;
  user_id?: number;
  serie_guia?: string;
  numero_guia?: string;
  aprobado_por?: number;
  rechazado_por?: number;
  aprobado_en?: string;
  rechazado_en?: string;
  created_at?: string;
  updated_at?: string;
  // Relaciones
  cliente?: Cliente;
  chofer?: Chofer;
  placa1?: Placa;
  placa2?: Placa;
  descripcion_jaba1?: DescripcionJaba;
  descripcion_jaba2?: DescripcionJaba;
  usuario?: Usuario;
  representante_cliente?: RepresentanteCliente;
  aprobadoPor?: Usuario;
  rechazadoPor?: Usuario;
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

  // ========== CLIENTES ==========
  getClientes(): Observable<Cliente[]> {
    return this.http.get<Cliente[]>(`${this.apiUrl}/clientes`);
  }

  getClientesActivos(): Observable<ApiResponse<Cliente[]>> {
    return this.http.get<ApiResponse<Cliente[]>>(
      `${this.apiUrl}/opciones/clientes`
    );
  }

  getCliente(id: number): Observable<ApiResponse<Cliente>> {
    return this.http.get<ApiResponse<Cliente>>(`${this.apiUrl}/clientes/${id}`);
  }

  createCliente(data: Partial<Cliente>): Observable<ApiResponse<Cliente>> {
    return this.http.post<ApiResponse<Cliente>>(
      `${this.apiUrl}/clientes`,
      data
    );
  }

  updateCliente(
    id: number,
    data: Partial<Cliente>
  ): Observable<ApiResponse<Cliente>> {
    return this.http.put<ApiResponse<Cliente>>(
      `${this.apiUrl}/clientes/${id}`,
      data
    );
  }

  deleteCliente(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/clientes/${id}`);
  }

  // ========== REPRESENTANTES DE CLIENTES ==========
  getRepresentantesClientes(
    clienteId?: number
  ): Observable<ApiResponse<RepresentanteCliente[]>> {
    const params = clienteId
      ? new HttpParams().set('cliente_id', clienteId.toString())
      : undefined;
    return this.http.get<ApiResponse<RepresentanteCliente[]>>(
      `${this.apiUrl}/representantes-clientes`,
      { params }
    );
  }

  getRepresentanteCliente(
    id: number
  ): Observable<ApiResponse<RepresentanteCliente>> {
    return this.http.get<ApiResponse<RepresentanteCliente>>(
      `${this.apiUrl}/representantes-clientes/${id}`
    );
  }

  createRepresentanteCliente(
    data: Partial<RepresentanteCliente>
  ): Observable<ApiResponse<RepresentanteCliente>> {
    return this.http.post<ApiResponse<RepresentanteCliente>>(
      `${this.apiUrl}/representantes-clientes`,
      data
    );
  }

  updateRepresentanteCliente(
    id: number,
    data: Partial<RepresentanteCliente>
  ): Observable<ApiResponse<RepresentanteCliente>> {
    return this.http.put<ApiResponse<RepresentanteCliente>>(
      `${this.apiUrl}/representantes-clientes/${id}`,
      data
    );
  }

  deleteRepresentanteCliente(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/representantes-clientes/${id}`
    );
  }

  activarRepresentanteCliente(
    id: number
  ): Observable<ApiResponse<RepresentanteCliente>> {
    return this.http.post<ApiResponse<RepresentanteCliente>>(
      `${this.apiUrl}/representantes-clientes/${id}/activar`,
      {}
    );
  }

  // ========== CHOFERES ==========
  getChoferes(clienteId?: number): Observable<any> {
    const params = clienteId
      ? new HttpParams().set('cliente_id', clienteId.toString())
      : undefined;
    return this.http.get<any>(`${this.apiUrl}/choferes`, { params });
  }

  getChoferesActivos(clienteId?: number): Observable<ApiResponse<Chofer[]>> {
    const params = clienteId
      ? new HttpParams().set('cliente_id', clienteId.toString())
      : undefined;
    return this.http.get<ApiResponse<Chofer[]>>(
      `${this.apiUrl}/opciones/choferes`,
      { params }
    );
  }

  getChofer(id: number): Observable<ApiResponse<Chofer>> {
    return this.http.get<ApiResponse<Chofer>>(`${this.apiUrl}/choferes/${id}`);
  }

  createChofer(data: Partial<Chofer>): Observable<ApiResponse<Chofer>> {
    return this.http.post<ApiResponse<Chofer>>(`${this.apiUrl}/choferes`, data);
  }

  updateChofer(
    id: number,
    data: Partial<Chofer>
  ): Observable<ApiResponse<Chofer>> {
    return this.http.put<ApiResponse<Chofer>>(
      `${this.apiUrl}/choferes/${id}`,
      data
    );
  }

  deleteChofer(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/choferes/${id}`);
  }

  // ========== PLACAS ==========
  getPlacas(): Observable<Placa[]> {
    return this.http.get<Placa[]>(`${this.apiUrl}/placas`);
  }

  getPlacasActivas(): Observable<ApiResponse<Placa[]>> {
    return this.http.get<ApiResponse<Placa[]>>(
      `${this.apiUrl}/opciones/placas`
    );
  }

  getPlaca(id: number): Observable<ApiResponse<Placa>> {
    return this.http.get<ApiResponse<Placa>>(`${this.apiUrl}/placas/${id}`);
  }

  createPlaca(data: Partial<Placa>): Observable<ApiResponse<Placa>> {
    return this.http.post<ApiResponse<Placa>>(`${this.apiUrl}/placas`, data);
  }

  updatePlaca(
    id: number,
    data: Partial<Placa>
  ): Observable<ApiResponse<Placa>> {
    return this.http.put<ApiResponse<Placa>>(
      `${this.apiUrl}/placas/${id}`,
      data
    );
  }

  deletePlaca(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/placas/${id}`);
  }

  // ========== DESCRIPCIONES JABAS ==========
  getDescripcionesJabas(): Observable<ApiResponse<DescripcionJaba[]>> {
    return this.http.get<ApiResponse<DescripcionJaba[]>>(
      `${this.apiUrl}/descripciones-jabas`
    );
  }

  getDescripcionesJabasActivas(): Observable<ApiResponse<DescripcionJaba[]>> {
    return this.http.get<ApiResponse<DescripcionJaba[]>>(
      `${this.apiUrl}/opciones/descripciones-jabas`
    );
  }

  getDescripcionesJabasActivasPorCliente(
    clienteId: number
  ): Observable<ApiResponse<DescripcionJaba[]>> {
    return this.http.get<ApiResponse<DescripcionJaba[]>>(
      `${this.apiUrl}/opciones/descripciones-jabas?cliente_id=${clienteId}`
    );
  }

  getDescripcionJaba(id: number): Observable<ApiResponse<DescripcionJaba>> {
    return this.http.get<ApiResponse<DescripcionJaba>>(
      `${this.apiUrl}/descripciones-jabas/${id}`
    );
  }

  createDescripcionJaba(
    data: Partial<DescripcionJaba>
  ): Observable<ApiResponse<DescripcionJaba>> {
    return this.http.post<ApiResponse<DescripcionJaba>>(
      `${this.apiUrl}/descripciones-jabas`,
      data
    );
  }

  updateDescripcionJaba(
    id: number,
    data: Partial<DescripcionJaba>
  ): Observable<ApiResponse<DescripcionJaba>> {
    return this.http.put<ApiResponse<DescripcionJaba>>(
      `${this.apiUrl}/descripciones-jabas/${id}`,
      data
    );
  }

  deleteDescripcionJaba(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(
      `${this.apiUrl}/descripciones-jabas/${id}`
    );
  }

  // ========== REGISTROS ==========
  getRegistros(filters?: {
    fecha_inicio?: string;
    fecha_fin?: string;
    cliente_id?: number;
    estado?: string;
    search?: string;
    per_page?: number;
    page?: number;
  }): Observable<PaginatedResponse<Registro>> {
    let params = new HttpParams();

    if (filters) {
      Object.keys(filters).forEach((key) => {
        if (
          filters[key as keyof typeof filters] !== undefined &&
          filters[key as keyof typeof filters] !== null
        ) {
          params = params.set(
            key,
            filters[key as keyof typeof filters]!.toString()
          );
        }
      });
    }

    return this.http.get<PaginatedResponse<Registro>>(
      `${this.apiUrl}/registros`,
      { params }
    );
  }

  getRegistro(id: number): Observable<ApiResponse<Registro>> {
    return this.http.get<ApiResponse<Registro>>(
      `${this.apiUrl}/registros/${id}`
    );
  }

  createRegistro(data: FormData): Observable<ApiResponse<Registro>> {
    return this.http.post<ApiResponse<Registro>>(
      `${this.apiUrl}/registros`,
      data
    );
  }

  updateRegistro(
    id: number,
    data: FormData
  ): Observable<ApiResponse<Registro>> {
    // Laravel no soporta PUT con FormData, usar POST con _method
    data.append('_method', 'PUT');
    return this.http.post<ApiResponse<Registro>>(
      `${this.apiUrl}/registros/${id}`,
      data
    );
  }

  deleteRegistro(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/registros/${id}`);
  }

  cambiarEstadoRegistro(
    id: number,
    estado: string,
    motivo_rechazo?: string,
    user_id?: number
  ): Observable<ApiResponse<Registro>> {
    return this.http.post<ApiResponse<Registro>>(
      `${this.apiUrl}/registros/${id}/cambiar-estado`,
      {
        estado,
        motivo_rechazo,
        user_id,
      }
    );
  }

  adjuntarPdfRegistro(
    id: number,
    formData: FormData
  ): Observable<ApiResponse<Registro>> {
    return this.http.post<ApiResponse<Registro>>(
      `${this.apiUrl}/registros/${id}/adjuntar-pdf`,
      formData
    );
  }

  descargarGuiaPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/registros/${id}/descargar-guia`, {
      responseType: 'blob',
    });
  }

  generarPdfRegistro(id: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/registros/${id}/generar-pdf`, {
      responseType: 'blob',
    });
  }

  exportarRegistros(filtros?: any): Observable<Blob> {
    let params = new HttpParams();
    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params = params.append(key, filtros[key]);
        }
      });
    }

    return this.http.get(`${this.apiUrl}/registros/exportar/excel`, {
      params,
      responseType: 'blob',
    });
  }

  // Dashboard
  getEstadisticas(filtros?: any): Observable<ApiResponse<any>> {
    let params = new HttpParams();
    if (filtros) {
      Object.keys(filtros).forEach((key) => {
        if (filtros[key]) {
          params = params.append(key, filtros[key]);
        }
      });
    }
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/dashboard/estadisticas`,
      { params }
    );
  }

  getTendencias(meses: number = 12): Observable<ApiResponse<any>> {
    const params = new HttpParams().set('meses', meses.toString());
    return this.http.get<ApiResponse<any>>(
      `${this.apiUrl}/dashboard/tendencias`,
      { params }
    );
  }

  // Usuarios
  getUsuarios(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(`${this.apiUrl}/usuarios`);
  }

  getUsuariosActivos(): Observable<ApiResponse<Usuario[]>> {
    return this.http.get<ApiResponse<Usuario[]>>(
      `${this.apiUrl}/opciones/usuarios`
    );
  }

  getUsuario(id: number): Observable<ApiResponse<Usuario>> {
    return this.http.get<ApiResponse<Usuario>>(`${this.apiUrl}/usuarios/${id}`);
  }

  createUsuario(data: Partial<Usuario>): Observable<ApiResponse<Usuario>> {
    return this.http.post<ApiResponse<Usuario>>(
      `${this.apiUrl}/usuarios`,
      data
    );
  }

  updateUsuario(
    id: number,
    data: Partial<Usuario>
  ): Observable<ApiResponse<Usuario>> {
    return this.http.put<ApiResponse<Usuario>>(
      `${this.apiUrl}/usuarios/${id}`,
      data
    );
  }

  deleteUsuario(id: number): Observable<ApiResponse<any>> {
    return this.http.delete<ApiResponse<any>>(`${this.apiUrl}/usuarios/${id}`);
  }

  // Roles
  getRoles(): Observable<ApiResponse<Role[]>> {
    return this.http.get<ApiResponse<Role[]>>(`${this.apiUrl}/roles`);
  }

  getRole(id: number): Observable<ApiResponse<Role>> {
    return this.http.get<ApiResponse<Role>>(`${this.apiUrl}/roles/${id}`);
  }

  // Importación masiva
  importarChoferes(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(
      `${this.apiUrl}/choferes/import`,
      formData
    );
  }

  importarDescripciones(file: File): Observable<ImportResult> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImportResult>(
      `${this.apiUrl}/descripciones-jabas/import`,
      formData
    );
  }
}
