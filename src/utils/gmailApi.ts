export interface GmailEmailSummary {
  id: string;
  threadId: string;
  snippet: string;
  from?: string;
  subject?: string;
  date?: string;
}

export interface GmailProfile {
  emailAddress: string;
  messagesTotal: number;
  threadsTotal: number;
  historyId: string;
}

// Helper to base64url encode text for Gmail RFC822 format
function base64UrlEncode(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binary = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binary += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

// 1. Send an email via Gmail API
export async function sendGmailEmail(
  accessToken: string,
  to: string,
  subject: string,
  body: string
): Promise<{ id: string; threadId: string; labelIds: string[] }> {
  if (!accessToken) {
    throw new Error('Google authorization token is missing. Please sign in with Google.');
  }

  const rawMessage = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${btoa(unescape(encodeURIComponent(subject)))}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    '',
    body,
  ].join('\r\n');

  const base64Encoded = base64UrlEncode(rawMessage);

  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ raw: base64Encoded }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(
      errorData.error?.message || `Gmail API error (${res.status}): Failed to send message.`
    );
  }

  return await res.json();
}

// 2. Fetch User Profile
export async function fetchGmailProfile(accessToken: string): Promise<GmailProfile> {
  const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/profile', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to fetch Gmail profile.');
  }

  return await res.json();
}

// 3. Fetch Recent Messages
export async function fetchRecentEmails(
  accessToken: string,
  maxResults = 8
): Promise<GmailEmailSummary[]> {
  const listRes = await fetch(
    `https://gmail.googleapis.com/gmail/v1/users/me/messages?maxResults=${maxResults}&q=label:INBOX`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!listRes.ok) {
    const errorData = await listRes.json().catch(() => ({}));
    throw new Error(errorData.error?.message || 'Failed to list Gmail messages.');
  }

  const listData = await listRes.json();
  const messages = listData.messages || [];

  const summaries: GmailEmailSummary[] = await Promise.all(
    messages.map(async (msg: { id: string; threadId: string }) => {
      try {
        const detailRes = await fetch(
          `https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=metadata&metadataHeaders=Subject&metadataHeaders=From&metadataHeaders=Date`,
          {
            headers: { Authorization: `Bearer ${accessToken}` },
          }
        );
        if (!detailRes.ok) return { id: msg.id, threadId: msg.threadId, snippet: '' };
        const detailData = await detailRes.json();
        const headers = detailData.payload?.headers || [];
        const subject = headers.find((h: any) => h.name.toLowerCase() === 'subject')?.value;
        const from = headers.find((h: any) => h.name.toLowerCase() === 'from')?.value;
        const date = headers.find((h: any) => h.name.toLowerCase() === 'date')?.value;
        return {
          id: msg.id,
          threadId: msg.threadId,
          snippet: detailData.snippet || '',
          subject,
          from,
          date,
        };
      } catch {
        return { id: msg.id, threadId: msg.threadId, snippet: '' };
      }
    })
  );

  return summaries;
}
