const { execSync } = require('child_process');

console.log("Deleting topics 19-24...");
execSync(`npx -y tsx -e "
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const slugs = ['lien-tu', 'gioi-tu', 'cau-truc-tiep-gian-tiep', 'tu-chi-so-luong-mao-tu', 'phan-tu-va-cum-phan-tu', 'cau-truc-dao-ngu'];
  await prisma.toeicGrammarTopic.deleteMany({ where: { slug: { in: slugs } } });
}
main().finally(() => prisma.\\$disconnect());
"`, { stdio: 'inherit' });

console.log("Deleted. Now inserting...");
for (let i = 19; i <= 24; i++) {
  console.log('Running insert-topic' + i + '.ts');
  execSync('npx -y tsx scratch/insert-topic' + i + '.ts', { stdio: 'inherit' });
}
console.log("All done!");
