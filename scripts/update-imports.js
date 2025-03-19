#!/usr/bin/env node

/**
 * This script updates import paths across the project to match the new directory structure.
 * It handles the following transformations:
 * - @/store/... -> @/features/game/store/... (for game-related stores)
 * - @/ui/... -> @/components/ui/...
 * - @/components/game/... -> @/features/game/components/...
 */

const fs = require("fs");
const path = require("path");
const { promisify } = require("util");

const readdir = promisify(fs.readdir);
const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const stat = promisify(fs.stat);

// Path mapping for imports
const importMappings = [
  // Game store imports
  { from: /@\/store\/gameStore/, to: "@/features/game/store/gameStore" },
  {
    from: /@\/store\/dealerTurnAction/,
    to: "@/features/game/store/dealerTurnAction",
  },
  { from: /@\/store\/hitAction/, to: "@/features/game/store/hitAction" },
  {
    from: /@\/store\/doubleDownAction/,
    to: "@/features/game/store/doubleDownAction",
  },
  { from: /@\/store\/splitAction/, to: "@/features/game/store/splitAction" },
  { from: /@\/store\/standAction/, to: "@/features/game/store/standAction" },

  // Betting imports
  { from: /@\/store\/placeBetAction/, to: "@/features/betting/placeBetAction" },

  // User/settings imports
  {
    from: /@\/store\/enhancedSettingsStore/,
    to: "@/features/user/enhancedSettingsStore",
  },
  {
    from: /@\/hooks\/useSettingsStore/,
    to: "@/features/user/useSettingsStore",
  },

  // Game component imports
  { from: /@\/components\/game\//, to: "@/features/game/components/" },
  {
    from: /@\/components\/BlackjackGame/,
    to: "@/features/game/components/BlackjackGame",
  },
  {
    from: /@\/components\/CardHand/,
    to: "@/features/game/components/CardHand",
  },
  {
    from: /@\/components\/PlayerControls/,
    to: "@/features/game/components/PlayerControls",
  },

  // Game hook imports
  {
    from: /@\/hooks\/useBlackjackStrategy/,
    to: "@/features/game/hooks/useBlackjackStrategy",
  },
  {
    from: /@\/hooks\/useDealerLogic/,
    to: "@/features/game/hooks/useDealerLogic",
  },
  {
    from: /@\/hooks\/useProbabilityEngine/,
    to: "@/features/game/hooks/useProbabilityEngine",
  },

  // UI imports
  { from: /@\/ui\//, to: "@/components/ui/" },
];

// File extensions to process
const extensions = [".ts", ".tsx", ".js", ".jsx"];

// Directories to skip
const skipDirs = ["node_modules", ".git", ".next", "dist", "build"];

// Process a file
async function processFile(filePath) {
  const ext = path.extname(filePath);
  if (!extensions.includes(ext)) return;

  try {
    let content = await readFile(filePath, "utf8");
    let modified = false;

    // Apply all mappings
    for (const mapping of importMappings) {
      const regex = new RegExp(mapping.from, "g");
      if (regex.test(content)) {
        content = content.replace(regex, mapping.to);
        modified = true;
      }
    }

    // Write back if modified
    if (modified) {
      console.log(`Updating imports in: ${filePath}`);
      await writeFile(filePath, content, "utf8");
    }
  } catch (error) {
    console.error(`Error processing ${filePath}:`, error);
  }
}

// Process all files in a directory recursively
async function processDirectory(dirPath) {
  const entries = await readdir(dirPath, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);

    if (entry.isDirectory()) {
      if (!skipDirs.includes(entry.name)) {
        await processDirectory(fullPath);
      }
    } else {
      await processFile(fullPath);
    }
  }
}

// Main function
async function main() {
  const srcDir = path.resolve(__dirname, "../src");
  console.log(`Updating imports in: ${srcDir}`);
  await processDirectory(srcDir);
  console.log("Import update complete!");
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});
