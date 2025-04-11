// extractContacts.js
// Parses plain text to find emails and phone numbers using regex

function extractContacts(bodyText) {
    // Regex pattern to match email addresses (basic standard)
    const emails = bodyText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-z]{2,}/g) || [];
  
    // Regex pattern to match phone numbers with optional country codes, dashes, spaces, etc.
    const phones = bodyText.match(/\+?\d{1,3}?[\\s.-]?\(?\d{2,4}\)?[\\s.-]?\d{3,4}[\\s.-]?\d{3,4}/g) || [];
  
    // Use Set to remove duplicates before returning
    return {
      emails: [...new Set(emails)],
      phones: [...new Set(phones)]
    };
  }
  
  module.exports = { extractContacts };  