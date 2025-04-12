// extractContacts.js
// Extracts emails and phone numbers from a string (international support)

function extractContacts(text) {
  const emails = [];
  const phones = [];

  // Loose but accurate email matching
  const emailRegex = /[\w.-]+@[\w.-]+\.\w+/g;

  // International phone regex (e.g., +1 123-456-7890 or 123.456.7890 or (123) 456 7890)
  const phoneRegex = /(?:\+?\d{1,3})?[\s.-]?\(?\d{2,4}\)?[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g;

  // Match raw patterns
  const rawEmails = text.match(emailRegex) || [];
  const rawPhones = text.match(phoneRegex) || [];

  // Normalize phone numbers (remove spaces/dashes, keep +)
  const uniquePhones = [...new Set(rawPhones.map(p =>
    p.replace(/[^+\d]/g, '') // remove non-digit, keep +
  ))];

  const uniqueEmails = [...new Set(rawEmails.map(e => e.trim().toLowerCase()))];

  return {
    emails: uniqueEmails,
    phones: uniquePhones
  };
}

module.exports = extractContacts;