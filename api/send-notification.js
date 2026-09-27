function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { name, email, phone, situation, reason } = req.body || {};

  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: process.env.NOTIFY_EMAIL,
        subject: '새 상담 신청이 접수되었습니다 - 도전30일 챌린지',
        html: `
          <h2>새로운 상담 신청</h2>
          <p><strong>이름:</strong> ${escapeHtml(name)}</p>
          <p><strong>이메일:</strong> ${escapeHtml(email)}</p>
          <p><strong>연락처:</strong> ${escapeHtml(phone)}</p>
          <p><strong>현재 상황:</strong> ${escapeHtml(situation)}</p>
          <p><strong>도전 이유:</strong> ${escapeHtml(reason)}</p>
        `
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      return res.status(502).json({ error: errText });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
