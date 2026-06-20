#!/usr/bin/env node
/**
 * GAS は全 .gs が単一のグローバルスコープを共有するため、
 * 同名のトップレベル定義(function / const / let / var)があると
 * 後勝ちで静かに上書きされ、不具合の原因になる。
 *
 * このスクリプトは全 *.gs を走査し、トップレベル定義名の重複を検出して
 * 重複があれば終了コード 1 で失敗する(CIで利用)。
 *
 * 使い方:
 *   node scripts/check-duplicate-functions.js          # 重複チェック(CI用)
 *   node scripts/check-duplicate-functions.js --list   # 全定義を一覧表示
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const LIST_MODE = process.argv.includes('--list');

// トップレベル(行頭=インデントなし)の定義のみを対象にする。
// 例: function foo(  /  const foo =  /  async function foo(
const FUNC_DECL = /^(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(/;
const ASSIGN_DECL = /^(?:const|let|var)\s+([A-Za-z0-9_$]+)\s*=/;

/** 定義名 -> [{file, line}] */
const defs = new Map();

const gsFiles = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.gs'))
  .sort();

for (const file of gsFiles) {
  const lines = fs.readFileSync(path.join(ROOT, file), 'utf8').split('\n');
  lines.forEach((line, i) => {
    // 行頭がコメント等のものは除外
    if (/^\s/.test(line)) return; // インデントあり= ネスト定義なので対象外
    if (/^(\/\/|\*|\/\*)/.test(line)) return; // コメント行

    const m = FUNC_DECL.exec(line) || ASSIGN_DECL.exec(line);
    if (!m) return;
    const name = m[1];
    if (!defs.has(name)) defs.set(name, []);
    defs.get(name).push({ file, line: i + 1 });
  });
}

if (LIST_MODE) {
  const names = [...defs.keys()].sort();
  for (const name of names) {
    const where = defs.get(name).map((d) => `${d.file}:${d.line}`).join(', ');
    console.log(`${name}\t${where}`);
  }
  console.log(`\n合計 ${defs.size} 定義 / ${gsFiles.length} ファイル`);
  process.exit(0);
}

const duplicates = [...defs.entries()].filter(([, locs]) => locs.length > 1);

if (duplicates.length > 0) {
  console.error('❌ トップレベル定義名が重複しています(GASでは後勝ちで上書きされます):\n');
  for (const [name, locs] of duplicates) {
    console.error(`  - ${name}`);
    for (const loc of locs) console.error(`      ${loc.file}:${loc.line}`);
  }
  console.error(`\n重複 ${duplicates.length} 件。いずれかをリネームしてください。`);
  process.exit(1);
}

console.log(`✅ 重複なし (${defs.size} 定義 / ${gsFiles.length} ファイルを検査)`);
process.exit(0);
