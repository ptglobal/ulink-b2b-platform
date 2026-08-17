'use client';

import { useState } from 'react';
import { Package } from '@/components/icons';
import SampleRequestModal from '@/components/sample-request/sample-request-modal';

interface RequestSampleButtonProps {
  productSlug: string;
  productName: string;
  skuCodes: string[];
  labels: {
    requestSampleBtn: string;
    modalTitle: string;
    modalDesc: string;
    contactName: string;
    email: string;
    company: string;
    phone: string;
    province: string;
    district: string;
    addressDetail: string;
    message: string;
    messagePlaceholder: string;
    selectProvince: string;
    selectDistrict: string;
    submit: string;
    submitting: string;
    success: string;
    error: string;
    required: string;
    invalidEmail: string;
    invalidPhone: string;
    product: string;
    skus: string;
  };
}

export default function RequestSampleButton({
  productSlug,
  productName,
  skuCodes,
  labels
}: RequestSampleButtonProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full inline-flex items-center justify-center gap-2 rounded-md border-2 border-primary px-4 py-2.5 text-sm font-medium text-primary hover:bg-primary hover:text-primary-foreground transition-colors"
      >
        <Package className="h-4 w-4" />
        {labels.requestSampleBtn}
      </button>

      <SampleRequestModal
        productSlug={productSlug}
        productName={productName}
        skuCodes={skuCodes}
        open={open}
        onClose={() => setOpen(false)}
        labels={labels}
      />
    </>
  );
}
