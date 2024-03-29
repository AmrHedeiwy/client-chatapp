'use client';

import { useSession } from '@/hooks/useSession';
import { useEffect, useState } from 'react';

export default function EmailVerificationMaskedEmail() {
  const session = useSession();
  const [maskedEmail, setMaskedEmail] = useState<string>('');

  useEffect(() => {
    if (!session || !session.data || !session.data.user) return;

    const email = session.data.user.email as string;

    // Extract the username and domain from the email
    const [username, domain] = email.split('@');

    // // Mask the username by replacing middle characters with asterisks
    const maskedUsername =
      username.charAt(0) +
      '*'.repeat(username.length - 2) +
      username.charAt(username.length - 1);

    /**
     * Create a masked email by combining the masked username and domain
     * @example Email: 'example@gmail.com' -> Masked: 'e*****e@gmail.com'
     */
    const maskedEmail = `${maskedUsername}@${domain}`;

    setMaskedEmail(maskedEmail);
  }, [session]);

  return maskedEmail;
}
