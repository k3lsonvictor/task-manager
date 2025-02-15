import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { Project, ProjectsService } from '../../services/api/projects.service';
import { MatIconModule } from '@angular/material/icon';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-home-layout',
  imports: [RouterModule, MatIconModule, ButtonComponent],
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

  onCreateProject() {
    this.projectsServices.triggerCreateProject();
  }

  onDeleteProject(projectId: string) {
    this.projectsServices.deleteProject(projectId).subscribe({
      next: () => {
        this.projectsServices.notifyProjectUpdate();
      }
    })
    this.router.navigate(['/tasks']);
  }

  onLogout() {
    // Remove o token do localStorage
    localStorage.removeItem('token');

    // Redireciona para a página de login
    this.router.navigate(['/login']);
  }
}
