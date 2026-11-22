// Shared with M1/M2: must match the scam_type values in the Report contract.
export const SCAM_TYPES = [
  { id: 'otp', en: 'OTP fraud', hi: 'OTP धोखाधड़ी', cg: 'ओटीपी ठगी' },
  { id: 'kyc', en: 'KYC fraud', hi: 'KYC धोखाधड़ी', cg: 'केवाईसी ठगी' },
  { id: 'fake_qr', en: 'Fake QR', hi: 'नकली QR', cg: 'नकली क्यूआर' },
  { id: 'phishing_link', en: 'Phishing link', hi: 'फ़र्ज़ी लिंक', cg: 'फ़र्ज़ी लिंक' },
  { id: 'loan_app', en: 'Loan app', hi: 'लोन ऐप', cg: 'लोन ऐप ठगी' },
  { id: 'scam_call', en: 'Scam call', hi: 'फ़र्ज़ी कॉल', cg: 'फ़र्ज़ी फोन' },
  { id: 'digital_arrest', en: 'Digital arrest', hi: 'डिजिटल अरेस्ट', cg: 'डिजिटल अरेस्ट' },
  { id: 'courier_customs', en: 'Courier / customs', hi: 'कूरियर / कस्टम', cg: 'कूरियर / कस्टम' },
  { id: 'fake_scheme', en: 'Fake scheme', hi: 'नकली योजना', cg: 'नकली योजना' },
  { id: 'mule_recruitment', en: 'Mule recruitment', hi: 'म्यूल खाता भर्ती', cg: 'म्यूल खाता भर्ती' },
  { id: 'other', en: 'Other', hi: 'अन्य', cg: 'दूसर' },
]

const BY_ID = Object.fromEntries(SCAM_TYPES.map((t) => [t.id, t]))
export const scamLabel = (id, lang = 'en') => BY_ID[id]?.[lang] ?? BY_ID[id]?.en ?? id
