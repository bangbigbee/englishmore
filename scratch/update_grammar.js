const fs = require('fs');

let c = fs.readFileSync('src/app/toeic-practice/grammar/[slug]/page.tsx', 'utf8');

c = c.split("toast('Đang ở chế độ thi thật. Nếu muốn thực hành, bạn hãy làm lại bài và chọn chế độ luyện tập', { icon: '⚠️', duration: 4000 });")
     .join("toast('Đang ở chế độ thi thật. Nếu muốn thực hành, bạn hãy làm lại bài và chọn chế độ luyện tập', { icon: '⚠️', duration: 4000, style: { border: '1px solid #ef4444', color: '#7f1d1d', background: '#fef2f2', fontWeight: 600 } });");

fs.writeFileSync('src/app/toeic-practice/grammar/[slug]/page.tsx', c);

let d = fs.readFileSync('src/components/TopNav.tsx', 'utf8');

d = d.split('text-[#14532d] ${pathname === \'/user/profile\' ? "opacity-100" : "opacity-80 group-hover:opacity-100"} max-w-[120px] truncate`} title={session.user?.name || "Cá Nhân"}>')
    .join('text-[#4c1d95] ${pathname === \'/user/profile\' ? "opacity-100" : "opacity-80 group-hover:opacity-100"} max-w-[120px] truncate`} title={session.user?.name || "Cá Nhân"}>');

d = d.split('<Link\n              href="/toeic-progress?tab=vocabulary-bank"\n              className={`flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px]')
    .join('<Link\n              href="/toeic-progress?tab=vocabulary-bank"\n              className={`relative overflow-hidden flex items-center gap-1.5 group transition-all duration-300 focus:outline-none cursor-pointer whitespace-nowrap pb-[6px] mt-1 border-b-[2px]');

d = d.split('<span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#14532d] ${pathname === \'/toeic-progress\' && (searchParams.get(\'tab\')?.endsWith(\'-bank\') || searchParams.get(\'tab\') === \'vocabulary-bank\') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>\n                 Sổ tay của tôi\n              </span>')
    .join('<span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#4c1d95] relative z-10 ${pathname === \'/toeic-progress\' && (searchParams.get(\'tab\')?.endsWith(\'-bank\') || searchParams.get(\'tab\') === \'vocabulary-bank\') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>\n                 Sổ tay của tôi\n              </span>\n              <span className="absolute top-0 w-[150%] h-full bg-gradient-to-r from-transparent via-[#4c1d95]/10 to-transparent -skew-x-12 pointer-events-none" style={{ animation: \'metallic-shine-sweep 4s ease-in-out infinite\' }} />');

d = d.split('<span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#14532d] ${pathname === \'/toeic-progress\' && searchParams.get(\'tab\')?.startsWith(\'reports\') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>\n                 Tiến độ học\n              </span>')
    .join('<span className={`text-[13px] xl:text-[14px] font-bold tracking-tight transition-all text-[#4c1d95] ${pathname === \'/toeic-progress\' && searchParams.get(\'tab\')?.startsWith(\'reports\') ? "opacity-100" : "opacity-80 group-hover:opacity-100"}`}>\n                 Tiến độ học\n              </span>');

fs.writeFileSync('src/components/TopNav.tsx', d);
