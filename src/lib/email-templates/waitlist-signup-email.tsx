interface WaitlistSignupEmailProps {
  email: string;
}

export function WaitlistSignupEmail({ email }: WaitlistSignupEmailProps) {
  return (
    <html>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>New Waitlist Signup</title>
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
            maxWidth: '500px',
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
                fontSize: '20px',
                fontWeight: 'bold',
                margin: 0,
              }}
            >
              New Waitlist Signup
            </h1>
          </div>

          <div style={{ padding: '32px' }}>
            <p
              style={{
                color: '#3f3f46',
                fontSize: '16px',
                lineHeight: '1.6',
                margin: '0 0 16px 0',
              }}
            >
              A new user has joined the provider waitlist:
            </p>

            <div
              style={{
                backgroundColor: '#f4f4f5',
                borderRadius: '6px',
                padding: '16px',
              }}
            >
              <p
                style={{
                  color: '#18181b',
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: 0,
                }}
              >
                <a href={`mailto:${email}`} style={{ color: '#2563eb', textDecoration: 'none' }}>
                  {email}
                </a>
              </p>
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
              This signup was submitted via the Buildipedia website.
            </p>
          </div>
        </div>
      </body>
    </html>
  );
}
