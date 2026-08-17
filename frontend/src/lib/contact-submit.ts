export type ContactSubmitPayload = {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
};

export async function submitContactRequest(
  payload: ContactSubmitPayload,
  fetchImpl: typeof fetch = fetch
): Promise<{ ok: true } | { ok: false; message: string }> {
  try {
    const response = await fetchImpl('/api/contact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (response.ok) {
      return { ok: true };
    }

    let message = 'Không thể gửi yêu cầu liên hệ. Vui lòng thử lại.';
    try {
      const body = (await response.json()) as { message?: string; error?: string };
      message = body.message ?? body.error ?? message;
    } catch {
      // Keep default message.
    }

    return { ok: false, message };
  } catch {
    return { ok: false, message: 'Không thể gửi yêu cầu liên hệ. Vui lòng kiểm tra kết nối mạng.' };
  }
}
