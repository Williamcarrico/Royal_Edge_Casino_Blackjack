#!/usr/bin/env node

/**
 * React Hooks Detector Script
 *
 * This script searches the codebase for patterns that might violate React's Rules of Hooks.
 * It's a basic static analysis tool that can help identify potential issues in your codebase.
 *
 * Usage: node scripts/check-hooks.js [directory]
 */

const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");

// Default directory to scan is src
const targetDir = process.argv[2] || "src";

console.log(`\n🔍 Scanning ${targetDir} for potential React hooks issues...\n`);

// Patterns that might indicate hook issues
const patterns = [
  {
    name: "Early returns before hooks",
    // Match patterns like "return null" or "return <Component />" before a useState/useEffect call
    regex: /return\s+(?:null|<|\(|{).*?\n.*?use[A-Z]/gs,
    severity: "high",
  },
  {
    name: "Hooks inside conditionals",
    // Match patterns like "if (condition) { ... useState(" or "condition && useState("
    regex:
      /(?:if|switch|\?|\&\&|\|\|)\s*(?:\(.*?\))?\s*{?\s*(?:.*?\n)*?\s*use[A-Z][a-zA-Z]+\(/gs,
    severity: "high",
  },
  {
    name: "Hooks inside loops",
    // Match patterns like "for (...) { ... useState(" or "array.map(() => { ... useState("
    regex:
      /(?:for|while|\.\s*(?:map|forEach|filter|reduce))\s*(?:\(.*?\))?\s*{?\s*(?:.*?\n)*?\s*use[A-Z][a-zA-Z]+\(/gs,
    severity: "high",
  },
  {
    name: "Conditional hook calls",
    // Match patterns like "someCondition && useEffect("
    regex: /(?:\w+)\s*(?:\&\&|\|\||\?)\s*use[A-Z][a-zA-Z]+\(/g,
    severity: "high",
  },
  {
    name: "Hook dependency arrays with probable errors",
    // Match potentially problematic dependency arrays in useEffect/useMemo/useCallback
    regex:
      /use(?:Effect|Memo|Callback)\(\s*(?:\(\)\s*=>|function\s*\(\)\s*)\s*{.*?(?:\bset[A-Z]\w*\(|\.\w+\(|\bawait\b).*?},\s*\[\s*\]\)/gs,
    severity: "medium",
  },
];

// File extensions to scan
const extensions = [".js", ".jsx", ".ts", ".tsx"];

// Counter for issues found
let totalIssues = 0;

/**
 * Recursively scan directories for files to check
 */
function scanDirectory(directory) {
  const files = fs.readdirSync(directory);

  files.forEach((file) => {
    const filePath = path.join(directory, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory() && !filePath.includes("node_modules")) {
      scanDirectory(filePath);
    } else if (stat.isFile() && extensions.includes(path.extname(filePath))) {
      checkFile(filePath);
    }
  });
}

/**
 * Check a single file for potential issues
 */
function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, "utf8");
    let fileHasIssues = false;

    // Skip files that don't use hooks
    if (
      !content.includes("use") ||
      !(
        content.includes("useState") ||
        content.includes("useEffect") ||
        content.includes("useRef") ||
        content.includes("useContext") ||
        content.includes("useMemo") ||
        content.includes("useCallback")
      )
    ) {
      return;
    }

    patterns.forEach((pattern) => {
      const matches = content.match(pattern.regex);

      if (matches && matches.length > 0) {
        if (!fileHasIssues) {
          console.log(`\n📁 ${filePath}`);
          fileHasIssues = true;
        }

        console.log(
          `  ⚠️  [${pattern.severity.toUpperCase()}] Potential issue: ${
            pattern.name
          }`
        );
        totalIssues += matches.length;

        // Show snippets for the first few matches
        matches.slice(0, 2).forEach((match, i) => {
          const snippet = match.replace(/\n/g, "\n    ").trim();
          console.log(
            `    ${i + 1}. ${
              snippet.length > 100 ? snippet.substring(0, 100) + "..." : snippet
            }`
          );
        });

        if (matches.length > 2) {
          console.log(`    ... and ${matches.length - 2} more similar issues`);
        }
      }
    });
  } catch (err) {
    console.error(`Error scanning ${filePath}:`, err.message);
  }
}

// Start scanning
try {
  scanDirectory(targetDir);

  if (totalIssues > 0) {
    console.log(
      `\n🚨 Found ${totalIssues} potential React hooks issues in your codebase.`
    );
    console.log(
      `   Review each location carefully and make sure you're following the Rules of Hooks:`
    );
    console.log(`   https://reactjs.org/docs/hooks-rules.html\n`);
  } else {
    console.log(`\n✅ No obvious hook issues found! Your code looks good.\n`);
    console.log(
      `   Remember that this is a basic check and can't catch all issues.`
    );
    console.log(
      `   For more thorough checks, use the eslint-plugin-react-hooks package.\n`
    );
  }

  // Suggest using ESLint for more thorough checking
  console.log(`ℹ️  For more thorough static analysis, run:`);
  console.log(
    `   npx eslint "${targetDir}/**/*.{js,jsx,ts,tsx}" --rule "react-hooks/rules-of-hooks: error"\n`
  );
} catch (err) {
  console.error("Error during scan:", err.message);
  process.exit(1);
}

// Make the script executable
exec("chmod +x scripts/check-hooks.js", (error) => {
  if (error) {
    console.error("Error making script executable:", error);
  }
});
