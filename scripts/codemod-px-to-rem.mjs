import fs from 'fs';
import path from 'path';

function getFiles(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.git') && !file.includes('dist')) {
        results = results.concat(getFiles(file));
      }
    } else if (file.endsWith('.astro') || file.endsWith('.css')) {
      results.push(file);
    }
  });
  return results;
}

export function pxToRem(numStr) {
  const num = parseFloat(numStr);
  if (isNaN(num)) return numStr;
  const rem = Math.round((num / 16) * 10000) / 10000;
  return `${rem}rem`;
}

// Convert CSS property value
export function convertCssValue(prop, val) {
  const p = prop.trim().toLowerCase();
  let v = val.trim();

  // Skip box-shadow, drop-shadow, filter
  if (p === 'box-shadow' || p.includes('shadow') || v.includes('drop-shadow')) {
    return val;
  }

  // Linear gradients for background grid lines: linear-gradient(var(--hairline) 1px, transparent 1px)
  if (v.includes('linear-gradient') && v.includes('1px')) {
    // Keep 1px inside linear-gradient
    return v.replace(/(\d*\.?\d+)px\b/g, (match, n) => {
      if (parseFloat(n) <= 1) return match;
      return pxToRem(n);
    });
  }

  // Border: keep 1px, 2px, 1.5px, 0.5px
  if (p.startsWith('border') || p.startsWith('outline') || p === 'stroke' || p === 'stroke-width') {
    if (p === 'border-radius') {
      // border-radius should be converted
      return v.replace(/(?<!max\(\s*)(\d*\.?\d+)px\b/g, (match, n) => {
        if (parseFloat(n) >= 999) return '999px';
        return pxToRem(n);
      });
    }
    // For borders, keep 1px and 2px
    return v.replace(/(?<!max\(\s*)(\d*\.?\d+)px\b/g, (match, n) => {
      const num = parseFloat(n);
      if (num <= 2) return match; // keep 1px, 2px
      return pxToRem(n);
    });
  }

  // Radius tokens in :root
  if (p.includes('radius') || p.startsWith('--r-') || p.startsWith('--admin-r-')) {
    return v.replace(/(?<!max\(\s*)(\d*\.?\d+)px\b/g, (match, n) => {
      if (parseFloat(n) >= 999) return '999px';
      return pxToRem(n);
    });
  }

  // Dividers / hairline lines
  if (p === 'height' && parseFloat(v) === 1) {
    return val; // keep height: 1px for lines
  }

  // Font-size: Guard rail 5 (never below 12px computed)
  if (p === 'font-size' || p.includes('fs-') || p.includes('font_size') || p === '--admin-fs-caption') {
    // If already wrapped in max(12px, ...), leave alone
    if (v.includes('max(12px') || v.includes('clamp(')) {
      return v;
    }
    return v.replace(/(\d*\.?\d+)px\b/g, (match, n) => {
      const num = parseFloat(n);
      if (num < 15) {
        return `max(12px, ${pxToRem(n)})`;
      }
      return pxToRem(n);
    });
  }

  // General conversion for gap, padding, margin, width, height, top, left, right, bottom, inset, etc.
  return v.replace(/(?<!max\(\s*)(\d*\.?\d+)px\b/g, (match, n) => {
    const num = parseFloat(n);
    // Only pills (explicitly 999px or 9999px) are preserved if in border-radius context, but here convert
    if (num <= 1 && (v.includes('translate') || v.includes('hairline'))) return match;
    return pxToRem(n);
  });
}

export function processCssBlock(cssText) {
  // Replace property: value; lines
  return cssText.replace(/([a-zA-Z0-9_\-\s]+)\s*:\s*([^;{}]*);/g, (match, prop, val) => {
    // If inside media query declaration line, skip
    if (prop.includes('@media') || prop.includes('@keyframes')) return match;
    const converted = convertCssValue(prop, val);
    return `${prop}: ${converted};`;
  });
}

export function processFile(filePath, dryRun = true) {
  let content = fs.readFileSync(filePath, 'utf8');
  let original = content;

  if (filePath.endsWith('.css')) {
    content = processCssBlock(content);
  } else if (filePath.endsWith('.astro')) {
    // Process <style> blocks
    content = content.replace(/(<style[^>]*>)([\s\S]*?)(<\/style>)/gi, (match, openTag, cssContent, closeTag) => {
      return `${openTag}${processCssBlock(cssContent)}${closeTag}`;
    });

    // Process inline style="..." attributes
    content = content.replace(/(style\s*=\s*["'])([^"']+)(["'])/gi, (match, openQuote, inlineStyle, closeQuote) => {
      // Split inline declarations
      const parts = inlineStyle.split(';').map(part => {
        if (!part.trim()) return part;
        const colIdx = part.indexOf(':');
        if (colIdx === -1) return part;
        const prop = part.slice(0, colIdx);
        const val = part.slice(colIdx + 1);
        return `${prop}: ${convertCssValue(prop, val)}`;
      });
      return `${openQuote}${parts.join(';')}${closeQuote}`;
    });
  }

  // Apply breakpoint updates if any
  if (filePath.includes('ProjectEditor.astro')) {
    content = content.replace(/@media\s*\(\s*max-width\s*:\s*1100px\s*\)\s*and\s*\(\s*min-width\s*:\s*769px\s*\)/g,
      '@media (max-width: 880px) and (min-width: 769px)');
  }
  if (filePath.includes('projects/index.astro') || filePath.includes('projects\\index.astro')) {
    content = content.replace(/@media\s*\(\s*max-width\s*:\s*1200px\s*\)\s*and\s*\(\s*min-width\s*:\s*769px\s*\)/g,
      '@media (max-width: 960px) and (min-width: 769px)');
  }
  if (filePath.includes('SocialRail.astro')) {
    content = content.replace(/@media\s*\(\s*max-width\s*:\s*1180px\s*\)/g,
      '@media (max-width: 940px)');
  }
  if (filePath.includes('index.astro') && !filePath.includes('projects') && !filePath.includes('admin')) {
    content = content.replace(/@media\s*\(\s*max-width\s*:\s*1180px\s*\)\s*and\s*\(\s*min-width\s*:\s*769px\s*\)/g,
      '@media (max-width: 940px) and (min-width: 769px)');
  }

  const changed = content !== original;
  if (changed && !dryRun) {
    fs.writeFileSync(filePath, content, 'utf8');
  }
  return { changed, diffCount: (content.match(/rem\b/g) || []).length - (original.match(/rem\b/g) || []).length };
}

// Only execute when run directly from CLI
if (process.argv[1] && process.argv[1].endsWith('codemod-px-to-rem.mjs')) {
  const isDryRun = process.argv.includes('--dry-run');
  const files = getFiles('src');

  console.log(`Processing ${files.length} files (dryRun=${isDryRun})...`);
  let totalChanged = 0;
  let totalRemAdded = 0;

  files.forEach(f => {
    const res = processFile(f, isDryRun);
    if (res.changed) {
      totalChanged++;
      totalRemAdded += res.diffCount;
      console.log(`✓ ${f.replace(/\\/g, '/')} (+${res.diffCount} rems)`);
    }
  });

  console.log(`\nFinished: ${totalChanged} files changed, ~${totalRemAdded} rem conversions.`);
}
