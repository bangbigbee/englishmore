const fs = require('fs');
let content = fs.readFileSync('prisma/schema.prisma', 'utf8');

const updated = content.replace(/model VocabularyItem \{[\s\S]*?@@index\(\[courseId, displayOrder\]\)\r?\n\}/, 
`model VocabularyItem {
  id           String   @id @default(cuid())
  courseId     String?
  word         String
  phonetic     String?
  englishDefinition String?
  meaning      String
  example      String?  @db.Text
  topic        String   @default("WarmUp")
  displayOrder Int      @default(1)
  isActive     Boolean  @default(true)

  synonyms     String?  @db.Text
  antonyms     String?  @db.Text
  collocations String?  @db.Text
  toeicTrap    String?  @db.Text
  mnemonicUrl  String?
  
  category     String   @default("GENERAL")

  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt

  course       Course?  @relation(fields: [courseId], references: [id], onDelete: Cascade)

  @@index([courseId])
  @@index([courseId, displayOrder])
  @@index([category])
}`);

fs.writeFileSync('prisma/schema.prisma', updated);
console.log('Done');
