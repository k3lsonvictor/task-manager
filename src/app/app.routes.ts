import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';
import { HomeComponent } from './pages/home/home.component';
import { authGuard } from './guards/auth.guard';
import { HomeLayoutComponent } from './layout/home-layout/home-layout.component';

export const routes: Routes = [
  {
    path: "login",
    component: LoginComponent
  },
  {
    path: "",
    redirectTo: "tasks",
    pathMatch: "full"
  },
  {
    path: "",
    component: HomeLayoutComponent,
    children: [
      { path: "tasks", component: HomeComponent, canActivate: [authGuard] },
      { path: "tasks/:projectId", component: HomeComponent, canActivate: [authGuard] }
    ]
  },
  {
    path: "**",
    redirectTo: "login"
  }
];
