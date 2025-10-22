import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AuthService } from '../../../services/auth.service';
import { MATERIAL_IMPORTS } from '../../../material.imports';

export interface UsuarioSimple {
  id: number;
  nombres: string;
  apellidos: string;
  email: string;
  rol_nombre: string;
  activo: boolean;
}

@Component({
  selector: 'app-gestionar-usuarios',
  standalone: true,
  imports: [CommonModule, RouterModule, ...MATERIAL_IMPORTS],
  templateUrl: './gestionar-usuarios.html',
  styleUrls: ['./gestionar-usuarios.css']
})
export class GestionarUsuariosComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['nombreCompleto', 'email', 'rol_nombre', 'activo', 'acciones'];
  dataSource = new MatTableDataSource<UsuarioSimple>();
  isLoading = true;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
      // Configuración de filtro personalizado
    this.dataSource.filterPredicate = (data: UsuarioSimple, filter: string) => {
      const dataStr = (data.nombres + data.apellidos + data.email + data.rol_nombre).toLowerCase();
      return dataStr.includes(filter);
    };
  }

  loadUsers(): void {
    this.isLoading = true;
    this.authService.getAllUsers({ limit: 1000 }).subscribe({ // Obtener todos
      next: (response) => {
        if (response.success && response.data) {
          // Mapeamos a la interfaz simple para la tabla
          this.dataSource.data = response.data.map((u: any) => ({
            id: u.id,
            nombres: u.nombres,
            apellidos: u.apellidos,
            email: u.email,
            rol_nombre: u.rol_nombre,
            activo: u.activo
          }));
        } else {
          this.showError(response.message || 'No se pudieron cargar los usuarios.');
          this.dataSource.data = [];
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error al cargar usuarios:', err);
        this.showError('Error de conexión al cargar usuarios.');
        this.isLoading = false;
        this.dataSource.data = [];
      }
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  editUser(id: number): void {
    this.router.navigate(['/dashboard-admin/usuarios/editar', id]);
  }

  // Helper para mostrar snackbars de error
  private showError(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}