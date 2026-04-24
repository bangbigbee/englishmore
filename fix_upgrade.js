const fs = require('fs');

let code = fs.readFileSync('temp.tsx', 'utf8');

// 1. Replace 3 columns with 2 columns
code = code.replace(/lg:grid-cols-3/g, 'lg:grid-cols-2 lg:max-w-4xl lg:mx-auto');

// 2. Remove FREE Tier completely
code = code.replace(/\{\/\* FREE Tier \*\/\}.*?\{\/\* PRO Tier \*\/\}/s, '{/* PRO Tier */}');

// 3. Update PRO tier price
code = code.replace(/<div className="text-3xl font-black text-slate-900 mt-4 mb-6">\s*\{formatPrice\(proPrice\)\}<span className="text-base font-normal text-slate-400">\/\{formatDuration\(proDuration\)\}<\/span>\s*<\/div>/s, 
  '<div className="text-3xl font-black text-slate-900 mt-4 mb-6">Miễn Phí<span className="text-base font-normal text-slate-400">/trọn đời</span></div>');

// 4. Update PRO tier description
code = code.replace(/Dành cho người thật sự muốn nâng cao điểm số hiệu quả./g, 'Đặc quyền miễn phí dành cho tất cả các thành viên.');

// 5. Update PRO tier buttons
code = code.replace(/\{effectiveTier === 'PRO' \? \([\s\S]*?\{checkingPending \? 'Đang tải\.\.\.' : 'Nâng Cấp PRO Ngay'\}\s*<\/button>\s*\)\}/s, 
  `{effectiveTier === 'FREE' ? (
              <button 
                onClick={() => setShowLoginModal(true)}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-black rounded-xl py-3.5 transition-all shadow-md active:scale-95 mt-auto"
              >
                Tạo Tài Khoản & Nhận Ngay
              </button>
          ) : effectiveTier === 'PRO' ? (
              <div className="py-3 text-center text-amber-600 text-xs font-bold uppercase tracking-widest border-t border-amber-200/60 mt-auto">Gói Hiện Tại Của Bạn</div>
          ) : (
              <div className="w-full bg-slate-100 text-slate-400 font-bold rounded-xl py-3.5 text-center mt-auto cursor-not-allowed text-sm border border-slate-200">Đã Bao Gồm</div>
          )}`);

// 6. Update currentUltraPrice logic
code = code.replace(/const currentUltraPrice = effectiveTier === 'PRO' \? ultraUpgradePrice : ultraPrice/g, 'const currentUltraPrice = ultraUpgradePrice;');

// 7. Update ULTRA pricing display (Fixing the regex issue)
// The target block in original temp.tsx is:
/*
            <div className="text-3xl font-black text-white mt-4 mb-6">
              {effectiveTier === 'PRO' ? (
                <div className="flex flex-col items-start gap-1">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl line-through text-purple-300/60 font-medium">{formatPrice(ultraPrice)}</span>
                    <span>{formatPrice(ultraUpgradePrice)}</span>
                  </div>
                  <div className="text-[10px] text-amber-300 mt-0.5 uppercase tracking-wider font-bold bg-amber-900/40 inline-flex px-2 py-0.5 rounded border border-amber-500/30">Đặc quyền nâng cấp cho PRO</div>
                </div>
              ) : (
                <>
                  {formatPrice(ultraPrice)}<span className="text-base font-normal text-purple-100/50">/{formatDuration(ultraDuration)}</span>
                </>
              )}
            </div>
*/
code = code.replace(/<div className="text-3xl font-black text-white mt-4 mb-6">[\s\S]*?<\/div>\s*<\/div>\s*<ul className="space-y-4 mb-8/s, 
`<div className="text-3xl font-black text-white mt-4 mb-6">
              {formatPrice(currentUltraPrice)}<span className="text-base font-normal text-purple-100/50">/trọn đời</span>
            </div>
          </div>
          
          <ul className="space-y-4 mb-8`);

// 8. Remove the roadmap tracking element entirely
// The target is <div className="mb-10 w-full bg-[#581c87]/[0.02] ... up to the end of that main div
code = code.replace(/<div className="mb-10 w-full bg-\[#581c87\]\/\[0\.02\][\s\S]*?<\/div>\s*<\/div>\s*<div className="border border-slate-200/s, '<div className="border border-slate-200');

fs.writeFileSync('src/app/toeic-practice/upgrade/page.tsx', code);
console.log('Fixed page.tsx');
