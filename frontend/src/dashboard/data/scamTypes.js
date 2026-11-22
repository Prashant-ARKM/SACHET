// Must match the shared contract scam_type values.
export const SCAM_TYPES = [
  { id: 'otp', en: 'OTP fraud', hi: 'OTP धोखाधड़ी' },
  { id: 'fake_qr', en: 'Fake QR', hi: 'नकली QR' },
  { id: 'loan_app', en: 'Loan app', hi: 'लोन ऐप' },
  { id: 'scam_call', en: 'Scam call', hi: 'फ़र्ज़ी कॉल' },
  { id: 'digital_arrest', en: 'Digital arrest', hi: 'डिजिटल अरेस्ट' },
  { id: 'fake_scheme', en: 'Fake scheme', hi: 'नकली योजना' },
  { id: 'mule_recruitment', en: 'Mule recruitment', hi: 'म्यूल खाता भर्ती' },
  { id: 'kyc', en: 'KYC fraud', hi: 'KYC धोखाधड़ी' },
  { id: 'other', en: 'Other', hi: 'अन्य' },
]

const BY_ID = Object.fromEntries(SCAM_TYPES.map((t) => [t.id, t]))
export const scamLabel = (id, lang = 'en') => BY_ID[id]?.[lang] ?? id
