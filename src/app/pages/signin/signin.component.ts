import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';
import { UserService } from '../../api/services/user.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.css'
})
export class SigninComponent {
  signInForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(3)] }),
    email: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl<string>('', { nonNullable: true, validators: [Validators.required, Validators.minLength(6)] })
  });

  constructor(private userService: UserService, private router: Router) {}

  navigateToLogin() {
    this.router.navigate(['/login']); // Altere para a rota desejada
  }

  signUp() {
    if (this.signInForm.invalid) {
      alert('Preencha os campos corretamente!');
      return;
    }

    const { name, email, password } = this.signInForm.value;

    this.userService.createUser(name!, email!, password!).subscribe({
      next: () => {
        alert('Cadastro realizado com sucesso!');
        this.router.navigate(['/tasks']);
      },
      error: () => alert('Erro ao realizar cadastro, tente novamente!'),
    });
  }
}
