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
const extractCompanyFromTitleOrLink = (title, link) => {
  if (!title && !link) return '';

  // Prefer splitting title first
  const titleParts = title.split('|');
  if (titleParts.length > 1) {
    return titleParts[1].trim();
  }

  // Fallback to domain from link
  try {
    const url = new URL(link);
    return url.hostname.replace('www.', '');
  } catch (err) {
    return '';
  }
};

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