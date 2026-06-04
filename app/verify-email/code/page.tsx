import { Suspense } from 'react';
import { VerifyEmailCode } from '@/components/auth/verify-email-code';

export default function VerifyEmailCodePage() {
  return (
    <Suspense>
      <VerifyEmailCode />
    </Suspense>
  );
}
