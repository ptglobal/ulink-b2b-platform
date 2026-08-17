export type RfqLineItem = { sku: string; note?: string };

export type RfqHubRef = {
  id: number;
  name: string;
  slug: string;
};

export type RfqIndustryRef = {
  id: number;
  name: string;
  slug: string;
};

export type RfqSalesOwnerRef = {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
};

export type RfqAssignmentRule = {
  id: number;
  hub?: RfqHubRef | null;
  industry?: RfqIndustryRef | null;
  assigned_sales?: RfqSalesOwnerRef | null;
  priority?: number | null;
  is_default?: boolean | null;
};

export type RfqRecord = {
  id: number | string;
  company: string;
  contact_name: string;
  email: string;
  phone?: string | null;
  hub?: RfqHubRef | null;
  industry?: string | RfqIndustryRef | null;
  message?: string | null;
  line_items: RfqLineItem[];
  source: 'web' | 'portal';
  assigned_sales?: RfqSalesOwnerRef | null;
};

export type SiteSettingsRecord = {
  contact_email: string | null;
};

export type ResolveRfqAssignmentInput = {
  rfq: RfqRecord;
  rules: RfqAssignmentRule[];
  siteSettings: SiteSettingsRecord;
};

export type ResolvedRfqAssignment = {
  matchedRuleId: number | null;
  assignedSalesId: string | null;
  assignedSalesEmail: string | null;
  notifyTo: string;
  fallbackUsed: boolean;
};

function normalizeSlug(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function getHubId(value: RfqRecord['hub']): number | null {
  if (!value) {
    return null;
  }

  return value.id;
}

function getIndustrySlug(value: RfqRecord['industry']): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === 'string') {
    return normalizeSlug(value);
  }

  return value.slug;
}

function getSalesOwnerEmail(value: RfqSalesOwnerRef | null | undefined): string | null {
  return value?.email ?? null;
}

function getSalesOwnerId(value: RfqSalesOwnerRef | null | undefined): string | null {
  return value?.id ?? null;
}

export function resolveRfqAssignment(input: ResolveRfqAssignmentInput): ResolvedRfqAssignment {
  const hubId = getHubId(input.rfq.hub);
  const industrySlug = getIndustrySlug(input.rfq.industry);

  const rankedRules = [...input.rules].sort((a, b) => {
    const priorityA = a.priority ?? 0;
    const priorityB = b.priority ?? 0;
    if (priorityA !== priorityB) {
      return priorityB - priorityA;
    }

    return a.id - b.id;
  });

  const exactMatch = rankedRules.find((rule) => {
    const ruleHubId = rule.hub?.id ?? null;
    const ruleIndustrySlug = rule.industry?.slug ? normalizeSlug(rule.industry.slug) : null;
    return ruleHubId === hubId && ruleIndustrySlug === industrySlug;
  });

  const selectedRule = exactMatch ?? rankedRules.find((rule) => rule.is_default === true) ?? null;
  const assignedSalesId = getSalesOwnerId(selectedRule?.assigned_sales);
  const assignedSalesEmail = getSalesOwnerEmail(selectedRule?.assigned_sales);
  const notifyTo = assignedSalesEmail ?? input.siteSettings.contact_email ?? '';

  return {
    matchedRuleId: selectedRule?.id ?? null,
    assignedSalesId,
    assignedSalesEmail,
    notifyTo,
    fallbackUsed: exactMatch === undefined
  };
}

function formatLineItems(items: RfqLineItem[]): string {
  return items.map((item) => `- ${item.sku}${item.note ? ` (${item.note})` : ''}`).join('\n');
}

function formatSalesName(owner: RfqSalesOwnerRef | null | undefined): string {
  if (!owner) {
    return 'Unassigned';
  }

  const fullName = [owner.first_name, owner.last_name].filter(Boolean).join(' ').trim();
  return fullName || owner.email;
}

export function buildRfqSummaryEmail(input: {
  baseUrl: string;
  rfqId: number | string;
  company: string;
  contactName: string;
  email: string;
  phone?: string | null;
  hubName?: string | null;
  industryName?: string | null;
  message?: string | null;
  lineItems: RfqLineItem[];
  assignedSales?: RfqSalesOwnerRef | null;
}): { subject: string; text: string } {
  const adminLink = `${input.baseUrl.replace(/\/$/, '')}/admin/content/rfq_requests/${input.rfqId}`;
  const lines = [
    `RFQ #${input.rfqId} - ${input.company}`,
    '',
    `Sales owner: ${formatSalesName(input.assignedSales)}`,
    `Company: ${input.company}`,
    `Contact: ${input.contactName}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone ?? '-'}`,
    `Hub: ${input.hubName ?? '-'}`,
    `Industry: ${input.industryName ?? '-'}`,
    `Message: ${input.message ?? '-'}`,
    '',
    'Items:',
    formatLineItems(input.lineItems),
    '',
    `Directus: ${adminLink}`
  ];

  return {
    subject: `RFQ #${input.rfqId} - ${input.company}`,
    text: lines.join('\n')
  };
}

export function buildDirectusNotificationPayload(input: {
  recipient: string;
  rfqId: number | string;
  subject: string;
  message: string;
  collection?: string;
  item?: number | string;
  link?: string;
}) {
  return {
    recipient: input.recipient,
    subject: input.subject,
    message: input.message,
    collection: input.collection ?? 'rfq_requests',
    item: input.item ?? input.rfqId,
    link: input.link ?? ''
  };
}
