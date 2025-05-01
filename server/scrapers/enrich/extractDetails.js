// extractDetails.js
// 📦 Helper functions for enriching scraped prospect details

// 📧 Extract emails and 📞 phones from text using your intentionally loose regex
const extractContacts = (text) => {
  console.log("[extractContacts] Raw input text:", text.slice(0, 300), '...');

  const emails = [];
  const phones = [];

  // Loose email regex
  const emailRegex = /[\w.+-]+@[\w-]+\.[\w.-]+/g;

  // Loose phone regex (international + local)
  const phoneRegex = /(?:\+?\d{1,4}[\s-]?)?(?:\(?\d{2,4}\)?[\s-]?)?\d{3,4}[\s-]?\d{3,4}/g;

  // Extract emails
  const foundEmails = text.match(emailRegex);
  if (foundEmails) {
    emails.push(...foundEmails);
    console.log(`[extractContacts] ✅ Found ${foundEmails.length} emails`);
  } else {
    console.log("[extractContacts] ⚠️ No emails found");
  }

  // Extract phones
  const foundPhones = text.match(phoneRegex);
  if (foundPhones) {
    phones.push(...foundPhones);
    console.log(`[extractContacts] ✅ Found ${foundPhones.length} phone numbers`);
  } else {
    console.log("[extractContacts] ⚠️ No phone numbers found");
  }

  return { emails, phones };
};

// 📛 Try extracting person's name from title (basic splitting)
const extractNameFromTitle = (title) => {
  if (!title) return '';
  const parts = title.split('|')[0].split('-')[0].trim();
  return parts;
};

// 🏢 Try extracting company name from title or link
function extractCompanyFromTitleOrLink(title, link) {
  // ✅ Prefer domain from link if available
  try {
    if (link) {
      const domain = new URL(link).hostname.replace(/^www\\./, '');
      return domain;
    }
  } catch (err) {
    // Continue to fallback
  }

  // 🧭 Fallback: Try extracting company name from title (after dash or pipe)
  const parts = title.split(/[-|]/).map(part => part.trim());
  if (parts.length > 1) {
    return parts[1]; // Usually format is: "CEO at Acme Corp – Home"
  }

  return '';
}

// 👔 Try extracting simple job title keywords from snippet
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

// 📤 Export all functions cleanly
module.exports = {
  extractContacts,
  extractNameFromTitle,
  extractCompanyFromTitleOrLink,
  extractJobTitleFromSnippet
};