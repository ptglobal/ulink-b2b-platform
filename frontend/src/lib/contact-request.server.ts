import { type ContactInput } from '@/lib/validators';

export type ContactRequestPayload = {
  full_name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  status: 'unread';
};

export interface ContactRequestWriter {
  writeContactRequest(payload: ContactRequestPayload): Promise<{ id: number | string }>;
}

function normalize(value: string) {
  return value.trim();
}

export async function saveContactRequest(
  input: ContactInput,
  deps: ContactRequestWriter
): Promise<{ id: number | string }> {
  const payload: ContactRequestPayload = {
    full_name: normalize(input.name),
    email: normalize(input.email).toLowerCase(),
    phone: normalize(input.phone),
    subject: normalize(input.subject),
    message: normalize(input.message),
    status: 'unread'
  };

  return deps.writeContactRequest(payload);
}
