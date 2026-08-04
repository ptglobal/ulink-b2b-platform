import React from 'react';
import { getTranslations } from 'next-intl/server';
import FaqAccordion from './faq-accordion';

interface FaqSectionProps {
  locale: string;
}

export default async function FaqSection({ locale }: FaqSectionProps) {
  const t = await getTranslations({ locale, namespace: 'solutions' });

  const faqItems = [
    {
      id: 1,
      question: t('faq.q1'),
      answer: t('faq.a1')
    },
    {
      id: 2,
      question: t('faq.q2'),
      answer: t('faq.a2')
    },
    {
      id: 3,
      question: t('faq.q3'),
      answer: t('faq.a3')
    },
    {
      id: 4,
      question: t('faq.q4'),
      answer: t('faq.a4')
    },
    {
      id: 5,
      question: t('faq.q5'),
      answer: t('faq.a5')
    },
    {
      id: 6,
      question: t('faq.q6'),
      answer: t('faq.a6')
    }
  ];

  return (
    <FaqAccordion
      sectionTitle={t('faq.sectionTitle')}
      sectionSubtitle={t('faq.sectionSubtitle')}
      items={faqItems}
    />
  );
}
