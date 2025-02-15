import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Project, ProjectsService } from '../../services/api/projects.service';

@Component({
  selector: 'app-home-layout',
  imports: [RouterModule],
  templateUrl: './home-layout.component.html',
  styleUrl: './home-layout.component.css'
})
export class HomeLayoutComponent {
  projects!: Project[];

  constructor(private projectsServices: ProjectsService, private router: Router) { }

  ngOnInit() {
    this.projectsServices.getProjects().subscribe(projects => {
      this.projects = projects;
    })

    // Monitora mudanças no projeto
    this.projectsServices.currentProject$.subscribe(project => {
      if (project) {
        console.log("Projeto atualizado no layout:", project);
      }
    });

    this.projectsServices.projectUpdated$.subscribe(() => {
      this.projectsServices.getProjects().subscribe(projects => {
        this.projects = projects;
      })
    })
  }

onLogout() {
  // Remove o token do localStorage
  localStorage.removeItem('token');
  
  // Redireciona para a página de login
  this.router.navigate(['/login']);
}
}
