import { Component } from '@angular/core';
import { NavController, ModalController } from '@ionic/angular';
import { User } from '../models/user.module';
import { LoadingController, ToastController } from '@ionic/angular';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { AngularFirestore } from '@angular/fire/compat/firestore';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage {
  user = {} as User;

  // Variables para controlar la visibilidad de contraseñas
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  constructor(
    private toastCtrl: ToastController,
    private loadingCtrl: LoadingController,
    private afAuth: AngularFireAuth,
    private navCtrl: NavController,
    private firestore: AngularFirestore,
    private modalController: ModalController
  ) {}

  // Método para alternar la visibilidad de la contraseña
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  // Método para alternar la visibilidad de la confirmación de contraseña
  toggleConfirmPasswordVisibility() {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  irAInicioSesion() {
    this.navCtrl.navigateForward('iniciarsesion');
  }

  async register() {
    if (this.formValidation()) {
      const loader = await this.loadingCtrl.create({
        message: "Espere por favor...."
      });
      await loader.present();
  
      try {
        if (!this.user.password) {
          this.showToast("Ingrese una contraseña válida.");
          return;
        }
  
        const credential = await this.afAuth.createUserWithEmailAndPassword(this.user.email, this.user.password);
        console.log(credential);
  
        if (credential.user) {
          await this.firestore.collection('users').doc(credential.user.uid).set({
            name: this.user.name,
            lastname: this.user.lastname,
            email: this.user.email,
            phone: this.user.phone,
            rut: this.user.rut,
            role: this.user.role
          });
          this.navCtrl.navigateForward("iniciarsesion");
  
        } else {
          this.showToast("Error al registrar el usuario. Inténtalo de nuevo.");
        }
  
      } catch (error: any) {
        const errorMessage = error.code === 'auth/email-already-in-use' 
            ? 'Este correo ya está en uso. Intenta con otro.' 
            : error.message || 'Error al registrar el usuario. Inténtalo de nuevo.';
        this.showToast(errorMessage);
      }
  
      await loader.dismiss();
    }
  }

  formValidation() {
    if (!this.user.email) {
      this.showToast("Ingrese un correo");
      return false;
    }
    if (!this.user.password) {
      this.showToast("Ingrese una contraseña");
      return false;
    }
    if (!this.user.name) {
      this.showToast("Ingrese su nombre");
      return false;
    }
    if (!this.user.lastname) {
      this.showToast("Ingrese su apellido");
      return false;
    }
    if (!this.user.rut) {
      this.showToast("Ingrese su RUT");
      return false;
    }
    if (this.user.rut.length !== 10 || !this.user.rut.includes('-')) {
      this.showToast("El RUT debe tener un formato válido (XXXXXXX-X)");
      return false;
    }
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(this.user.email)) {
      this.showToast("Ingrese un correo válido");
      return false;
    }
    if (this.user.password.length < 6) {
      this.showToast("La contraseña debe tener al menos 6 caracteres");
      return false;
    }
    return true; 
  }

  showToast(message: string) {
    this.toastCtrl.create({
      message: message,
      duration: 4000
    }).then(toastData => toastData.present());
  }
}
