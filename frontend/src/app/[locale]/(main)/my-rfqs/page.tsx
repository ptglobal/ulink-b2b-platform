import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { MyRfqsClient } from '@/components/rfq/my-rfqs-client';

export const dynamic = 'force-dynamic';

export default async function MyRfqsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect('/login');
  }

  return <MyRfqsClient />;
}
