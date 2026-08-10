import { redirect } from 'next/navigation';

interface SolutionDetailPageProps {
  params: Promise<{
    locale: string;
    slug: string;
  }>;
}

export default async function SolutionDetailPage({ params }: SolutionDetailPageProps) {
  const { locale, slug } = await params;
  redirect(`/${locale}/products/${slug}`);
}
