import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { isPlatformBrowser } from '@angular/common';
import { Inject, PLATFORM_ID } from '@angular/core';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verify-email.html',
  styleUrl: './verify-email.css',
})
export class VerifyEmail implements OnInit {
  verifyForm!: FormGroup;
  email: string = '';
  isLoading = false;
  isResending = false;
  resendCountdown = 0;
  errorMessage = '';
  successMessage = '';

  private isBrowser: boolean;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    @Inject(PLATFORM_ID) platformId: Object,
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
    this.initializeForm();
  }

  ngOnInit(): void {
    if (!this.isBrowser) return;

    const emailFromState = history.state?.email;

    if (emailFromState) {
      this.email = emailFromState;
      sessionStorage.setItem('verifyEmail', this.email);
    } else {
      this.email = sessionStorage.getItem('verifyEmail') || '';
      if (!this.email) {
        this.router.navigate(['/register']);
      }
    }
  }

  private initializeForm(): void {
    this.verifyForm = this.fb.group({
      code: [
        '',
        [
          Validators.required,
          Validators.minLength(6),
          Validators.maxLength(6),
          Validators.pattern(/^\d+$/),
        ],
      ],
    });
  }

  onVerify(): void {
    if (this.verifyForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const verifyData = {
      email: this.email,
      verificationCode: this.verifyForm.value.code,
    };

    console.log('Sending verification data:', verifyData);

    this.authService.verifyEmail(verifyData).subscribe({
      next: (response) => {
        console.log('Email verified successfully:', response);
        this.isLoading = false;
        this.successMessage = 'Email verified successfully! Redirecting to login...';
        
        sessionStorage.removeItem('verifyEmail');

        setTimeout(() => {
          console.log('Navigating to login...');
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (error) => {
        console.error('Verification error:', error);
        
        // Si el status es 200, es en realidad un éxito pero con problema de parsing
        if (error.status === 200) {

        } else {
          this.isLoading = false;
          this.errorMessage = error.error?.message || 'Invalid verification code. Please try again.';
        }
      },
    });
  }

  onResendCode(): void {
    this.isResending = true;
    this.errorMessage = '';

    this.authService.resendVerificationCode({ email: this.email }).subscribe({
      next: () => {
        this.isResending = false;
        this.successMessage = 'Verification code sent to your email!';
        this.startResendCountdown();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (error) => {
        this.isResending = false;
        this.errorMessage = error.error?.message || 'Failed to resend code. Please try again.';
      },
    });
  }

  private startResendCountdown(): void {
    this.resendCountdown = 60;
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown === 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.verifyForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }
}
