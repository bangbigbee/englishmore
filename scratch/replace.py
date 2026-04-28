import re

with open('src/components/InteractiveListeningModal.tsx', 'r') as f:
    content = f.read()

# 1. Replace yellow- and amber-
content = content.replace('yellow-400', 'secondary-400')
content = content.replace('yellow-500', 'secondary-500')
content = content.replace('yellow-600', 'secondary-600')
content = content.replace('amber-600', 'secondary-600')

# 2. Remove (Part X)
content = content.replace('Câu đơn (Part 1, 5)', 'Câu đơn')
content = content.replace('Hỏi & Đáp (Part 2)', 'Hỏi & Đáp')
content = content.replace('Bài nói ngắn (Part 4)', 'Bài nói ngắn')

# 3. Change hamburger menu text color to secondary-400
content = content.replace('rounded-full text-slate-400 transition-all border border-slate-800 cursor-pointer">\n              <svg className="w-5 h-5"', 'rounded-full text-secondary-400 transition-all border border-slate-800 cursor-pointer">\n              <svg className="w-5 h-5"')

# 4. Update container width to max-w-[100vw]
content = content.replace('max-w-6xl mx-auto p-4 md:p-8 flex flex-col lg:flex-row gap-8 lg:gap-16 pt-24 pb-8', 'w-full max-w-[100vw] mx-auto p-4 md:px-12 flex flex-col lg:flex-row gap-8 lg:gap-16 pt-24 pb-8')

# 5. Update column widths
# Left Column: Audio & Context
content = content.replace('w-full lg:w-1/2 flex flex-col justify-center items-center space-y-12', 'w-full lg:w-[35%] flex flex-col justify-center items-center space-y-12')
# Right Column: Interaction Area
content = content.replace('w-full lg:w-1/2 flex flex-col justify-center items-center', 'w-full lg:w-[65%] flex flex-col justify-center items-center')

with open('src/components/InteractiveListeningModal.tsx', 'w') as f:
    f.write(content)
