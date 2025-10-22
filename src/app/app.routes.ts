import { Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login';
import { RegisterComponent } from './auth/register/register';
import { ForgotPasswordComponent } from './auth/forgot-password/forgot-password'
import { ResetPasswordComponent } from './auth/reset-password/reset-password';
import { ActivateAccountComponent } from './auth/activate-account/activate-account';
import { DashboardComponent } from './dashboard/dashboard';
import { InicioComponent } from './dashboard/pages/inicio/inicio';
import { MisTicketsComponent } from './dashboard/pages/mis-tickets/mis-tickets';
import { CrearTicketComponent } from './dashboard/pages/crear-ticket/crear-ticket';
import { DetalleTicketUsuarioComponent } from './dashboard/pages/detalle-ticket-usuario/detalle-ticket-usuario';
import { MisEquiposComponent } from './dashboard/pages/mis-equipos/mis-equipos';
import { DetalleEquipoUsuarioComponent } from './dashboard/pages/detalle-equipo-usuario/detalle-equipo-usuario';
import { GestionarPerfilComponent } from './dashboard/pages/gestionar-perfil/gestionar-perfil';
import { DashboardAdminComponent } from './dashboard-admin/dashboard-admin';
import { InicioAdminComponent } from './dashboard-admin/pages/inicio-admin/inicio-admin';
import { GestionarTicketsComponent } from './dashboard-admin/pages/gestionar-tickets/gestionar-tickets';
import { AsignarTicketComponent } from './dashboard-admin/pages/asignar-ticket/asignar-ticket';
import { CambiarEstadoTicketComponent } from './dashboard-admin/pages/cambiar-estado-ticket/cambiar-estado-ticket';
import { DetalleTicketComponent } from './dashboard-admin/pages/detalle-ticket/detalle-ticket';
import { GestionarInventarioComponent } from './dashboard-admin/pages/inventario/gestionar-inventario/gestionar-inventario';
import { CrearEquipoComponent } from './dashboard-admin/pages/inventario/crear-equipo/crear-equipo';
import { DetalleEquipoComponent } from './dashboard-admin/pages/inventario/detalle-equipo/detalle-equipo';
import { EditarEquipoComponent } from './dashboard-admin/pages/inventario/editar-equipo/editar-equipo';
import { AsignarUsuarioEquipoComponent } from './dashboard-admin/pages/inventario/asignar-usuario-equipo/asignar-usuario-equipo';
import { GestionarUsuariosComponent } from './dashboard-admin/pages/gestionar-usuarios/gestionar-usuarios';
import { EditarUsuarioAdminComponent } from './dashboard-admin/pages/editar-usuario-admin/editar-usuario-admin';


// Importar guards
import { AuthGuard } from './guards/auth.guard';
import { RoleGuard } from './guards/role.guard';
import { GuestGuard } from './guards/guest.guard';

export const routes: Routes = [
  // Rutas públicas (solo para usuarios NO autenticados)
  { 
    path: 'login', 
    component: LoginComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'register', 
    component: RegisterComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'forgot-password', 
    component: ForgotPasswordComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'reset-password', 
    component: ResetPasswordComponent,
    canActivate: [GuestGuard]
  },
  { 
    path: 'activate-account', 
    component: ActivateAccountComponent
    // Sin guard - puede ser accedido por cualquiera
  },

  // Rutas protegidas para usuarios autenticados
  // Dashboard con rutas hijas
  { 
    path: 'dashboard', 
    component: DashboardComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['usuario', 'user'] },
    children: [
      { path: '', redirectTo: 'inicio', pathMatch: 'full' },
      { path: 'inicio', component: InicioComponent },
      { path: 'tickets', component: MisTicketsComponent },
      { path: 'tickets/crear', component: CrearTicketComponent },
      { path: 'tickets/:id', component: DetalleTicketUsuarioComponent },
      { path: 'inventario', component: MisEquiposComponent },
      { path: 'inventario/:id', component: DetalleEquipoUsuarioComponent },
      { path: 'perfil', component: GestionarPerfilComponent }
    ]
  },
  { 
    path: 'dashboard-admin', 
    component: DashboardAdminComponent,
    canActivate: [AuthGuard, RoleGuard],
    data: { roles: ['admin', 'tecnico', 'admin_tecnico'] }, // Admin y técnicos
    children: [
      { path: '', redirectTo: 'inicio-admin', pathMatch: 'full' },
      { path: 'inicio-admin', component: InicioAdminComponent },
      { path: 'tickets/gestionar', component: GestionarTicketsComponent },
      { path: 'tickets/asignar/:id', component: AsignarTicketComponent },
      { path: 'tickets/cambiar-estado/:id', component: CambiarEstadoTicketComponent },
      { path: 'tickets/:id', component: DetalleTicketComponent },
      { path: 'inventario/gestionar', component: GestionarInventarioComponent, data: { roles: ['admin', 'tecnico'] } },
      { path: 'inventario/crear', component: CrearEquipoComponent, data: { roles: ['admin'] } },
      { path: 'inventario/detalle/:id', component: DetalleEquipoComponent, data: { roles: ['admin', 'tecnico'] } },
      { path: 'inventario/editar/:id', component: EditarEquipoComponent, data: { roles: ['admin', 'tecnico'] } },
      { path: 'inventario/:id/asignar-usuario', component: AsignarUsuarioEquipoComponent, data: { roles: ['admin', 'tecnico'] } },
      { path: 'usuarios', component: GestionarUsuariosComponent, data: { roles: ['admin'] } },
      { path: 'usuarios/editar/:id', component: EditarUsuarioAdminComponent, data: { roles: ['admin'] } }
    ]
  },

  // Ruta por defecto
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];