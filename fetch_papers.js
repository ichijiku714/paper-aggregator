const Parser = require('rss-parser');
const parser = new Parser({
    headers: {
        // 「私はChromeブラウザです」と名乗ることで、406エラーを回避します
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*'
    }
});
// 1. 取得したいジャーナルのリスト（名前とURLのペア）
const JOURNALS = [
    { name: 'Nature Photonics', url: 'https://www.nature.com/nphoton.rss' },
    { name: 'Nature Nanotechnology', url: 'https://www.nature.com/nnano.rss' },
    { name: 'Nature Communications', url: 'https://www.nature.com/ncomms.rss' },
    { name: 'APL (Applied Physics Letters)', url: 'https://pubs.aip.org/rss/site_1000017/1000011.xml' },
    { name: 'Optica (Optics Express)', url: 'https://opg.optica.org/rss/opex_feed.xml' },
    { name: 'Nano Letters (ACS)', url: 'https://pubs.acs.org/action/showFeed?jc=nalefd&type=etoc&feed=rss' }
];

// 2. フィルタリングキーワード（研究内容に合わせて調整してください）
const KEYWORDS = ['Photonic Crystal', 'Moiré', 'Nanobeam', 'InP', 'InGaAsP', 'Laser',"cavity","transfer print","quantum","resonator","parity-time symmetry"];

async function fetchAllJournals() {
    console.log(`--- 論文取得開始: ${new Date().toLocaleString()} ---\n`);

    // ジャーナルの数だけ順番に処理
    for (const journal of JOURNALS) {
        try {
            console.log(`📢 ${journal.name} を確認中...`);
            const feed = await parser.parseURL(journal.url);
            
            let matchCount = 0;

            feed.items.forEach(item => {
                // タイトルまたはアブストラクトにキーワードが含まれているか
                const content = (item.title + (item.contentSnippet || "")).toLowerCase();
                const isMatch = KEYWORDS.some(key => content.includes(key.toLowerCase()));

                /*if (isMatch) {
                    matchCount++;
                    console.log(`   ✨ [Hit!] ${item.title}`);
                    console.log(`   🔗 ${item.link}\n`);
                }*/
                console.log(`   ✨ [Hit!] ${item.title}`);
                console.log(`   🔗 ${item.link}\n`);
                 
            });

            if (matchCount === 0) {
                console.log(`   (キーワードに合致する新着はありませんでした)\n`);
            } else {
                console.log(`   ✅ ${matchCount}件の関連論文が見つかりました。\n`);
            }

        } catch (error) {
            console.error(`   ❌ ${journal.name} の取得に失敗しました: ${error.message}\n`);
        }
    }
    console.log("--- すべての確認が完了しました ---");
}

fetchAllJournals();