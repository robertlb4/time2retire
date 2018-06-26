import { Component } from '@angular/core';
import { IonicPage, NavController, ToastController, LoadingController } from 'ionic-angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PasswordValidation } from './password-validation';
import { EmailValidation } from './email-validation';

import { User } from '../../providers';
import { MainPage } from '../';

@IonicPage()
@Component({
  selector: 'page-signup',
  templateUrl: 'signup.html'
})
export class SignupPage {
  //Form related stuff
  myForm: FormGroup;
  signupAttempt: boolean = false;

  //clean user instance
  newUser: any;

  //live password validation
  userFocused: boolean = false;
  emptyField: boolean = false;
  testPassword: string = '';
  length: boolean;
  capital: boolean;
  lower: boolean;
  special: boolean;
  number: boolean;
  sweetPassword: boolean;
 
  //showPassword properties
  isPassword: string = 'password';
  isActive: string = 'eye-off';

  //RegEx strings
  passwordRegEx = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/
  emailRegEx = '^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9]+)*(\\.[A-Za-z]{2,})$'
 

  constructor(public navCtrl: NavController,
              public _user: User,
              public toastCtrl: ToastController,
              public loader: LoadingController,
              public fb: FormBuilder) {
    this.createForm();
  }

  onFocus(event){
    console.log(event)
    this.userFocused = true;
  }
  onBlur(event){
    console.log(event)
    this.userFocused = false;
  }

  passwordStrength(event){
    /* event.value = current value 
    present in password field */

    //Independent RegEx strings
    let lengthCheck = new RegExp('^.{8}');
    let capitalCheck = new RegExp('^(?=.*[A-Z])');
    let lowerCheck = new RegExp('^(?=.*[a-z])');
    let specialCheck = new RegExp('^(?=.*[!@#$&*])');
    let numberCheck = new RegExp('^(?=.*[0-9])');

    //RegEx checks, fire for every instance of event.value
    this.capital = capitalCheck.test(event.value)
    this.lower = lowerCheck.test(event.value)
    this.length = lengthCheck.test(event.value)
    this.special = specialCheck.test(event.value)
    this.number = numberCheck.test(event.value)

    //final check ensures all regEx checks return true
    this.sweetPassword = this.capital && this.lower && this.length && this.special && this.number ? true : false;       
  }

  createForm(){
    this.myForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      birthday: ['', Validators.required],
      email: ['', Validators.compose([
        Validators.required,
        Validators.pattern(this.emailRegEx)
      ])],
      confirmEmail: ['', Validators.required],
      password: ['', Validators.compose([
        Validators.required,
        Validators.pattern(this.passwordRegEx)
      ])],
      confirmPassword: ['', Validators.required]
    }, {
      validator: [PasswordValidation.MatchPassword,EmailValidation.MatchEmail]
    })
  }

  newSignup() {
    let loader = this.loader.create({})
    loader.present();
    return this._user.signupCustom(this.newUser)
      .subscribe((newUser: any) => {
        let toast = this.toastCtrl.create({
          message: 'Registration Successful',
          duration: 2000,
          position: 'top',
        });
        toast.present()
        console.log(newUser, 'Signup Successful');
        this._user.user = newUser;
        this._user.userBirthday = newUser.birthday
        sessionStorage.setItem('token', newUser.token)
        sessionStorage.setItem('userId', newUser.userId)
        this._user.user = this.newUser;
        this.navCtrl.setRoot(MainPage);
        loader.dismiss()
      }, (failureObject) => {
        if(failureObject.error.error.message.includes(this.newUser.email)){
          let toast = this.toastCtrl.create({
            message: `User "${this.newUser.email}" already exists.`,
            duration: 4000,
            position: 'top',
          });
          toast.present()
        }
        else{
          let toast = this.toastCtrl.create({
            message: `Oops. Something Went wrong, Please try again later.`,
            duration: 4000,
            position: 'top',
          });
          toast.present()
        }
        this.newUser.firstName = '';
        this.newUser.lastName = '';
        this.newUser.birthday = '';
        this.newUser.email = '';
        this.newUser.password = '';
        loader.dismiss();
      }
    )
  }

  submit(){
    this.signupAttempt = true;
    if(this.myForm.valid){
      this.newUser = {
        firstName: this.myForm.controls.firstName.value,
        lastName: this.myForm.controls.lastName.value,
        birthday: this.myForm.controls.birthday.value,
        email: this.myForm.controls.email.value.toLowerCase(),
        password: this.myForm.controls.password.value
      }
    } 
    else {
      let toast = this.toastCtrl.create({
        message: 'Registration Unsuccessful',
        duration: 3000,
        position: 'top',
      });
      toast.present()
    }     
  }

  //showPassword methods
  showHide() {
    this.changeEyeIcon();
    this.changePasswordType();
  }
  //changes eye Icon "name" on click 
  changeEyeIcon(){
    this.isActive = 
      this.isActive === 'eye-off' ?
        "eye" : "eye-off" 
  }
  //changes password field "type" on click
  changePasswordType(){
    this.isPassword = 
      this.isPassword === 'password' ?
        "text" : "password"
  }
}
