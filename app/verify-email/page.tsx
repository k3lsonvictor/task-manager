import { Suspense } from 'react';
import { VerificationRequired } from '@/components/auth/verification-required';

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerificationRequired />
    </Suspense>
  );
}
