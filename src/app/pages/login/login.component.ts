import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { LoginService } from '../../services/login.service';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm = new FormGroup({
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  constructor(private loginService: LoginService, private router: Router) {}

  login() {
    if (this.loginForm.invalid) {
      alert('Preencha os campos corretamente!');
      return;
    }

    const { email, password } = this.loginForm.value;

    this.loginService.login(email!, password!).subscribe({
      next: () => this.router.navigate(['/tasks']),
      error: () => alert('Usuário ou senha inválidos!'),
    });
  }
}
