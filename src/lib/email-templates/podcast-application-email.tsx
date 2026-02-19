import type { PodcastApplicationFormData } from '@/lib/validations/podcast-application';

interface PodcastApplicationEmailProps {
  data: PodcastApplicationFormData;
}

export function PodcastApplicationEmail({ data }: PodcastApplicationEmailProps) {
  const applicationTypeLabel = data.applicationType === 'guest' ? 'Guest' : 'Co-Host';

  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Podcast Application</title>
      </head>
      <body
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
          backgroundColor: '#f4f4f5',
          margin: 0,
          padding: '40px 20px',
        }}
      >
        <div
          style={{
            maxWidth: '600px',
            margin: '0 auto',
            backgroundColor: '#ffffff',
            borderRadius: '8px',
            overflow: 'hidden',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
          }}
        >
          <div
            style={{
              backgroundColor: '#18181b',
              padding: '24px 32px',
            }}
          >
            <h1
              style={{
                color: '#ffffff',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              New Podcast Application
            </h1>
            <p
              style={{
                color: '#a1a1aa',
                fontSize: '14px',
                margin: '8px 0 0 0',
              }}
            >
              Application Type: {applicationTypeLabel}
            </p>
          </div>

          <div style={{ padding: '32px' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
              }}
            >
              <tbody>
                <Row label="First Name" value={data.firstName} />
                <Row label="Last Name" value={data.lastName} />
                <Row label="Email" value={data.email} isLink />
                <Row label="Phone" value={data.phone} />
                <Row label="City" value={data.city} />
                <Row label="LinkedIn" value={data.linkedinUrl} isLink />
                <Row label="Work Sample" value={data.workSampleUrl} isLink />
              </tbody>
            </table>

            <div style={{ marginTop: '24px' }}>
              <Section title="Industry Expertise" content={data.industryExpertise} />
              <Section title="Unique Insight" content={data.uniqueInsight} />
            </div>
          </div>

          <div
            style={{
              backgroundColor: '#f4f4f5',
              padding: '16px 32px',
              borderTop: '1px solid #e4e4e7',
            }}
          >
            <p
              style={{
                color: '#71717a',
                fontSize: '12px',
                margin: 0,
                textAlign: 'center' as const,
              }}
            >
              This application was submitted via the Buildipedia website.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}

function Row({ label, value, isLink = false }: { label: string; value: string; isLink?: boolean }) {
  return (
    <tr>
      <td
        style={{
          padding: '12px 0',
          borderBottom: '1px solid #e4e4e7',
          color: '#71717a',
          fontSize: '14px',
          width: '140px',
          verticalAlign: 'top',
        }}
      >
        {label}
      </td>
      <td
        style={{
          padding: '12px 0',
          borderBottom: '1px solid #e4e4e7',
          color: '#18181b',
          fontSize: '14px',
        }}
      >
        {isLink ? (
          <a
            href={value.includes('@') ? `mailto:${value}` : value}
            style={{ color: '#2563eb', textDecoration: 'none' }}
          >
            {value}
          </a>
        ) : (
          value
        )}
      </td>
    </tr>
  );
}

function Section({ title, content }: { title: string; content: string }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3
        style={{
          color: '#18181b',
          fontSize: '14px',
          fontWeight: '600',
          margin: '0 0 8px 0',
        }}
      >
        {title}
      </h3>
      <p
        style={{
          color: '#3f3f46',
          fontSize: '14px',
          lineHeight: '1.6',
          margin: 0,
          whiteSpace: 'pre-wrap' as const,
        }}
      >
        {content}
      </p>
    </div>
  );
}
