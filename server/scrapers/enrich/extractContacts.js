// extractContacts.js
// Extract emails and phone numbers from a given text using regex

const extractContacts = (text) => {
  console.log("[extractContacts] Raw input text:", text.slice(0, 300), '...'); // Print preview of content

  const emails = [];
  const phones = [];

  // Regex for email (loose but effective)
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

  // Regex for phones (international + local, loose and flexible)
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

  // Extract emails
  const foundEmails = text.match(emailRegex);
  if (foundEmails) {
    emails.push(...foundEmails);
    console.log(`[extractContacts] ✅ Found ${foundEmails.length} emails`);
  } else {
    console.log("[extractContacts] ⚠️ No emails found");
  }

  // Extract phone numbers
  const foundPhones = text.match(phoneRegex);
  if (foundPhones) {
    phones.push(...foundPhones);
    console.log(`[extractContacts] ✅ Found ${foundPhones.length} phone numbers`);
  } else {
    console.log("[extractContacts] ⚠️ No phone numbers found");
  }

  return { emails, phones };
};

module.exports = { extractContacts };