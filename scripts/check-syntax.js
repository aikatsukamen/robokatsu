#!/usr/bin/env node
/**
 * 全 *.gs の構文チェック。
 * vm.Script で「コンパイル(=構文解析)のみ」を行い、実行はしない。
 * そのため未定義のGASグローバル(SpreadsheetApp 等)があっても問題なく、
 * 構文エラーだけを検出できる。
 *
 * ホスト/CI で実ファイルを直接検査するので、開発サンドボックスの
 * マウント同期遅延の影響を受けない。
 *
 *   node scripts/check-syntax.js
 */
'use strict';

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const files = fs
  .readdirSync(ROOT)
  .filter((f) => f.endsWith('.gs'))
  .sort();

let bad = 0;
for (const f of files) {
  const code = fs.readFileSync(path.join(ROOT, f), 'utf8');
  try {
    // 実行はせず、構文解析だけを行う
    new vm.Script(code, { filename: f });
  } catch (e) {
    bad++;
    console.error(`NG ${f}: ${e.message}`);
  }
}

if (bad > 0) {
  console.error(`\n構文エラー ${bad} 件`);
  process.exit(1);
}

console.log(`構文OK (${files.length} ファイル)`);
