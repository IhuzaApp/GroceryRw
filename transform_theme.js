const fs = require("fs");
const glob = require("glob");

const filesToProcess = [
  "pages/Cart/index.tsx",
  "pages/plasBusiness/portal/index.tsx",
  "pages/Reels/index.tsx",
  "pages/CurrentPendingOrders/index.tsx",
  "pages/CurrentPendingOrders/viewPackageDetails/[packageId].tsx",
];

function processFile(filePath) {
  if (!fs.existsSync(filePath)) {
    console.log(`File not found: ${filePath}`);
    return;
  }
  let content = fs.readFileSync(filePath, "utf8");

  // Replace common ternary strings
  content = content.replace(
    /\btheme\s*===\s*"dark"\s*\?\s*"bg-gray-[0-9]+"\s*:\s*"bg-[A-Za-z0-9-]+"/g,
    '"bg-[var(--bg-secondary)]"'
  );
  content = content.replace(
    /\btheme\s*===\s*"dark"\s*\?\s*"text-white"\s*:\s*"text-gray-900"/g,
    '"text-[var(--text-primary)]"'
  );
  content = content.replace(
    /\btheme\s*===\s*"dark"\s*\?\s*"text-gray-300"\s*:\s*"text-gray-[0-9]+"/g,
    '"text-[var(--text-secondary)]"'
  );
  content = content.replace(
    /\btheme\s*===\s*"dark"\s*\?\s*"border-gray-[0-9]+"\s*:\s*"border-gray-[0-9]+"/g,
    '"border-[var(--text-secondary)]"'
  );
  content = content.replace(
    /\btheme\s*===\s*"dark"\s*\?\s*"text-gray-[0-9]+"\s*:\s*"text-gray-[0-9]+"/g,
    '"text-[var(--text-secondary)]"'
  );

  // Replace static bg-white strings if they are meant to be bg-primary
  // content = content.replace(/\bbg-white\b/g, 'bg-[var(--bg-primary)]');
  // Wait, let's just do dynamic replacement for bg-white inside className="... bg-white ..."
  content = content.replace(
    /className=(["'])(.*?)\bbg-white\b(.*?)\1/g,
    "className=$1$2bg-[var(--bg-primary)]$3$1"
  );

  // Also static text-gray-900 to text-primary
  content = content.replace(
    /className=(["'])(.*?)\btext-gray-900\b(.*?)\1/g,
    "className=$1$2text-[var(--text-primary)]$3$1"
  );
  content = content.replace(
    /className=(["'])(.*?)\btext-black\b(.*?)\1/g,
    "className=$1$2text-[var(--text-primary)]$3$1"
  );

  // General text-gray-500/600 to text-secondary
  content = content.replace(
    /className=(["'])(.*?)\btext-gray-500\b(.*?)\1/g,
    "className=$1$2text-[var(--text-secondary)]$3$1"
  );

  // Let's replace "bg-gray-50" or "bg-gray-100" main containers
  content = content.replace(
    /className=(["'])(.*?)\bbg-gray-50\b(.*?)\1/g,
    "className=$1$2bg-[var(--bg-primary)]$3$1"
  );
  content = content.replace(
    /className=(["'])(.*?)\bbg-gray-100\b(.*?)\1/g,
    "className=$1$2bg-[var(--bg-secondary)]$3$1"
  );

  fs.writeFileSync(filePath, content, "utf8");
  console.log(`Processed: ${filePath}`);
}

filesToProcess.forEach(processFile);
