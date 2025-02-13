import { Component, Input } from '@angular/core';
import { LoginService } from '../../services/login.service';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { InputComponent } from '../../components/input/input.component';
import { ButtonComponent } from '../../components/button/button.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, InputComponent, ButtonComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email = new FormControl<string>('')
  password = new FormControl<string>('')

  constructor(private loginService: LoginService) {
  }


  login() {
    if (!this.loginService.login(this.email.value!, this.password.value!)) {
      alert("User or password invalid!")
    }
  }
}
