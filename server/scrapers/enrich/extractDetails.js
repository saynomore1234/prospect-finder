// extractDetails.js
// 📦 Helper functions for enriching scraped prospect details

// 📧 Extract emails and 📞 phones from text using intentionally loose regex
const extractContacts = (text) => {
  const emails = [];
  const phones = [];

  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

  const foundEmails = text.match(emailRegex);
  if (foundEmails) emails.push(...foundEmails);

  const foundPhones = text.match(phoneRegex);
  if (foundPhones) phones.push(...foundPhones);

  return { emails, phones };
};

// 📛 Extracts a possible name from the title bar (basic string slicing)
const extractNameFromTitle = (title) => {
  if (!title) return '';
  const parts = title.split('|')[0].split('-')[0].trim();
  return parts;
};

// 🏢 Uses the page title or domain to guess a company name
function extractCompanyFromTitleOrLink(title, link) {
  try {
    if (link) {
      const domain = new URL(link).hostname.replace(/^www\./, '');
      return domain;
    }
  } catch (err) {
    // fallback continues
  }

  const parts = title.split(/[-|]/).map(part => part.trim());
  if (parts.length > 1) {
    return parts[1];
  }

  return '';
}

// 👔 Pulls a keyword-style job title from snippet (if available)
const extractJobTitleFromSnippet = (snippet) => {
  if (!snippet) return '';
  const jobKeywords = ['CEO', 'Founder', 'Director', 'Manager', 'Consultant', 'Engineer', 'Developer', 'President'];

  for (const keyword of jobKeywords) {
    if (snippet.toLowerCase().includes(keyword.toLowerCase())) {
      return keyword;
    }
  }

  return '';
};

// 🧠 NEW FUNCTION: Attempts to parse a real human name + title from raw paragraph text
function extractProspectFromText(text) {
  // Looks for a structure like: "John Dela Cruz is the IT Manager at..."
  const regex = /([A-Z][a-z]+(?: [A-Z][a-z]+)+)[,\s]+(?:is|serves as|works as|has been)?\s*(?:the)?\s*(CEO|Founder|Manager|Director|Consultant|Engineer|Developer|President)\b/i;

  const match = text.match(regex);
  if (match) {
    return {
      prospectName: match[1]?.trim() || '',
      prospectTitle: match[2]?.trim() || '',
      company: '' // Optional: can be improved with "at XYZ Corp" logic
    };
  }

  return { prospectName: '', prospectTitle: '', company: '' };
}

// 📤 Export all helper functions
module.exports = {
  extractContacts,
  extractNameFromTitle,
  extractCompanyFromTitleOrLink,
  extractJobTitleFromSnippet,
  extractProspectFromText // ✅ NEW EXPORT
};
