import { Injectable } from '@angular/core';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private user = { email: "admin@gmail.com", passoword: "123456" };

  constructor(private router: Router) { }

  login(email: string, passoword: string): boolean {
    if (email === this.user.email && passoword === this.user.passoword) {
      localStorage.setItem("token", "fake-token");
      this.router.navigate(["/tasks"])
      return true;
    }
    return false;
  }

  logout() {
    localStorage.removeItem("token");
    this.router.navigate(["/login"])
  }

  isAutenticated(): boolean {
    return !!localStorage.getItem("token")
  }
}
