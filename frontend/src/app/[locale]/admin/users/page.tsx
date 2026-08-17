import React from 'react';
import { redirect } from '@/i18n/navigation';
import { getCurrentUser } from '@/lib/auth-helpers';
import { createWriteDirectusClient, Schema } from '@/lib/directus';
import { createDirectus, rest, readUsers, readRoles } from '@directus/sdk';
import { cookies } from 'next/headers';
import { getDirectusUrl } from '@/lib/directus-runtime.mjs';
import { UsersClient } from '@/components/admin/users-client';

async function getSessionClient() {
  const store = await cookies();
  const sessionToken = store.get('directus_session_token')?.value;
  const refreshToken = store.get('directus_refresh_token')?.value;

  if (sessionToken) {
    const cookieHeader = [
      `directus_session_token=${sessionToken}`,
      refreshToken ? `directus_refresh_token=${refreshToken}` : null
    ]
      .filter(Boolean)
      .join('; ');

    const cookieFetch: typeof globalThis.fetch = (input, init) => {
      const headers = new Headers(init?.headers);
      headers.set('cookie', cookieHeader);
      return globalThis.fetch(input, { ...init, headers });
    };

    const url = getDirectusUrl();
    return createDirectus<Schema>(url, { globals: { fetch: cookieFetch } }).with(rest());
  }

  return createWriteDirectusClient();
}

interface PageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default async function AdminUsersPage({ params }: PageProps) {
  const { locale } = await params;

  // 1. Authenticate user
  const user = await getCurrentUser();
  if (!user) {
    redirect({ href: '/login', locale });
  }

  let users: any[] = [];
  let roles: any[] = [];
  let error: string | undefined;

  try {
    const client = await getSessionClient();

    // 2. Fetch Users and System Roles in parallel
    const [usersRes, rolesRes] = await Promise.all([
      client.request(
        readUsers({
          fields: [
            'id',
            'first_name',
            'last_name',
            'email',
            'status',
            'role.id',
            'role.name'
          ] as any,
          limit: -1
        })
      ),
      client.request(
        readRoles({
          fields: ['id', 'name'],
          limit: -1
        })
      )
    ]);

    users = usersRes || [];
    roles = rolesRes || [];
  } catch (err) {
    console.error('Failed to load system users or roles in admin panel:', err);
    try {
      error = JSON.stringify(err, null, 2);
    } catch {
      error = String(err);
    }
  }

  return (
    <div className="w-full px-4 py-8 sm:px-8 lg:px-12">
      <UsersClient initialUsers={users} roles={roles} error={error} />
    </div>
  );
}
