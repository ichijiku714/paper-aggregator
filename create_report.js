const Parser = require('rss-parser');
const fs = require('fs'); // ファイル書き出し用

const parser = new Parser({
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }
});
// --- ここでJSONファイルを読み込む ---
let JOURNALS = [];
try {
    const jsonRaw = fs.readFileSync('journals.json', 'utf8');
    JOURNALS = JSON.parse(jsonRaw);
} catch (err) {
    console.error("journals.json の読み込みに失敗しました。ファイルを確認してください。");
    process.exit(1);
}


const KEYWORDS = ['Photonic Crystal', 'Moiré', 'Nanobeam', 'InP', 'InGaAsP', 'Laser',"cavity","transfer print","quantum","resonator","parity-time symmetry"];
async function createReport() {
    let htmlContent = `
    <!DOCTYPE html>
    <html lang="ja">
    <head>
        <meta charset="UTF-8">
        <title>最新論文レポート</title>
        <style>
            body { font-family: sans-serif; line-height: 1.6; max-width: 900px; margin: auto; padding: 20px; background: #f8f9fa; }
            h1 { color: #333; border-bottom: 3px solid #007bff; padding-bottom: 10px; }
            .journal-section { background: white; margin-bottom: 30px; padding: 20px; border-radius: 8px; shadow: 0 2px 5px rgba(0,0,0,0.1); }
            .paper-item { margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #eee; }
            .paper-item.hit { background: #fff9c4; border-left: 5px solid #fbc02d; padding-left: 10px; }
            .paper-title { font-weight: bold; color: #0056b3; text-decoration: none; }
            .paper-title:hover { text-decoration: underline; }
            .date { font-size: 0.85em; color: #666; }
            .tag { font-size: 0.75em; background: #007bff; color: white; padding: 2px 6px; border-radius: 4px; margin-right: 5px; }
        </style>
    </head>
    <body>
        <h1>📚 最新論文自動巡回レポート (${new Date().toLocaleDateString()})</h1>
    `;
    // 2. 目次 (Table of Contents) の生成
    htmlContent += `<div class="toc"><h2>目次 (Quick Links)</h2><ul>`;
    JOURNALS.forEach((journal, index) => {
        htmlContent += `<li><a href="#journal-${index}">${journal.name}</a></li>`;
    });
    htmlContent += `</ul></div>`;
// 3. 各ジャーナルの内容生成
    for (let i = 0; i < JOURNALS.length; i++) {
        const journal = JOURNALS[i];
        try {
            console.log(`${journal.name} を取得中...`);
            const feed = await parser.parseURL(journal.url);
            
            // 各セクションにIDを付与: id="journal-0", "journal-1"...
            htmlContent += `<div class="journal-section" id="journal-${i}">
                <h2>${journal.name}</h2>`;
            
            feed.items.forEach(item => {
                const isMatch = KEYWORDS.some(key => 
                    (item.title + (item.contentSnippet || "")).toLowerCase().includes(key.toLowerCase())
                );
                
                const hitClass = isMatch ? 'hit' : '';
                const tag = isMatch ? '<span class="tag">Keyword Hit!</span>' : '';

                htmlContent += `
                <div class="paper-item ${hitClass}">
                    ${tag}
                    <a href="${item.link}" class="paper-title" target="_blank">${item.title}</a><br>
                    <small>📅 ${formatDate(item)}</small>
                </div>`;
            });
            htmlContent += `</div>`;
        } catch (error) {
            htmlContent += `<div class="journal-section" id="journal-${i}" style="color:red;">
                <h2>${journal.name}</h2>取得エラー: ${error.message}</div>`;
        }
    }

/*    for (const journal of JOURNALS) {
        try {
            console.log(`${journal.name} を取得中...`);
            const feed = await parser.parseURL(journal.url);
            
            htmlContent += `<div class="journal-section"><h2>${journal.name}</h2>`;
            
            feed.items.forEach(item => {
                const isMatch = KEYWORDS.some(key => 
                    (item.title + (item.contentSnippet || "")).toLowerCase().includes(key.toLowerCase())
                );

                const hitClass = isMatch ? 'hit' : '';
                const tag = isMatch ? '<span class="tag">Keyword Hit!</span>' : '';

                htmlContent += `
                <div class="paper-item ${hitClass}">
                    ${tag}
                    <a href="${item.link}" class="paper-title" target="_blank">${item.title}</a><br>
                    <span class="date">📅 ${formatDate(item)}</span>
                </div>`;
            });

            htmlContent += `</div>`;
        } catch (error) {
            htmlContent += `<p style="color:red;">❌ ${journal.name} の取得エラー: ${error.message}</p>`;
        }
    }
*/
    htmlContent += `</body></html>`;

    // ファイルに保存
    fs.writeFileSync('index.html', htmlContent);
    console.log('\n✅ index.html を作成しました。ブラウザで開いて確認してください！');
}
// --- 日付を安全に取得するための補助関数 ---
function formatDate(item) {
    // 候補となるプロパティを順番にチェック
    const dateStr = item.pubDate || item.isoDate || item['dc:date'];
    
    if (!dateStr) return '日付不明';

    const date = new Date(dateStr);
    // 有効な日付オブジェクトにならなかった場合のフォールバック
    if (isNaN(date.getTime())) return '日付フォーマットエラー';

    return date.toLocaleDateString();
}
//createReport();
async function run() {
    await createReport(); // レポート作成が終わるのを待つ
    console.log('\n✅ すべての処理が完了しました。終了します。');
    process.exit(0);      // ここでプログラムを強制的に終了させる
}

run();