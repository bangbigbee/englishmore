import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Starting Phase 1 grammar insertion...');

  const dataToInsert = [
    // 1. Cấu trúc Chủ ngữ
    {
      titleBase: 'Cấu trúc Chủ ngữ & Danh từ',
      slugBase: 'cau-truc-chu-ngu',
      subtitle: 'Nắm vững danh từ đếm được, quán từ, sở hữu cách làm chủ ngữ.',
      part: 5,
      levels: [
        {
          levelName: 'Cơ Bản',
          questions: [
            {
              question: 'We need to buy some _____ for the new office.',
              optionA: 'furnitures',
              optionB: 'furniture',
              optionC: 'a furniture',
              optionD: 'the furnitures',
              correctOption: 'B',
              explanation: '"Furniture" (đồ nội thất) là danh từ không đếm được trong tiếng Anh, nên không có dạng số nhiều "s" và không dùng mạo từ "a/an".',
              translation: 'Chúng ta cần mua một số đồ nội thất cho văn phòng mới.',
              tips: 'Các danh từ không đếm được phổ biến trong TOEIC: information, equipment, luggage, baggage, advice, furniture.'
            },
            {
              question: 'He is _____ honest person who always tells the truth.',
              optionA: 'a',
              optionB: 'an',
              optionC: 'the',
              optionD: 'some',
              correctOption: 'B',
              explanation: 'Từ "honest" bắt đầu bằng âm câm "h", nguyên âm phát âm đầu tiên là /ɒ/ nên ta dùng mạo từ "an" thay vì "a".',
              translation: 'Anh ấy là một người trung thực, người luôn nói sự thật.',
              tips: 'Chú ý cách phát âm từ đứng ngay sau mạo từ. (an hour, an honest man).'
            }
          ]
        },
        {
          levelName: 'Trung Cấp',
          questions: [
            {
              question: '_____ the employees attended the training session yesterday.',
              optionA: 'A lot',
              optionB: 'Much of',
              optionC: 'Most of',
              optionD: 'Every',
              correctOption: 'C',
              explanation: '"Most of" đi với danh từ xác định (có the/tính từ sở hữu). "A lot" thiếu "of", "Much" dùng cho danh từ không đếm được, "Every" đi với danh từ số ít.',
              translation: 'Hầu hết nhân viên đã tham dự buổi tập huấn hôm qua.',
              tips: 'Most of + the + N(đếm được số nhiều/không đếm được).'
            },
            {
              question: 'The _____ report shows a significant increase in profits this quarter.',
              optionA: 'manager',
              optionB: 'managers',
              optionC: 'manager\'s',
              optionD: 'managers\'s',
              correctOption: 'C',
              explanation: 'Sở hữu cách chỉ sự sở hữu của "manager" (người quản lý) đối với "report" (báo cáo). Dùng manager\'s (của người quản lý).',
              translation: 'Báo cáo của người quản lý cho thấy sự gia tăng đáng kể về lợi nhuận trong quý này.',
              tips: 'Sở hữu cách cho danh từ số ít: Noun + \'s.'
            }
          ]
        },
        {
          levelName: 'Nâng Cao',
          questions: [
            {
              question: 'There is only _____ time left before the deadline, so we must hurry.',
              optionA: 'a little',
              optionB: 'little',
              optionC: 'a few',
              optionD: 'few',
              correctOption: 'A',
              explanation: '"Time" là danh từ không đếm được nên loại "a few" và "few". "A little" mang nghĩa khẳng định (còn một chút đủ để làm gì đó), phù hợp ngữ cảnh.',
              translation: 'Chỉ còn một chút thời gian trước hạn chót, vì vậy chúng ta phải nhanh lên.',
              tips: 'a little = một chút (đủ dùng), little = rất ít (gần như không có).'
            },
            {
              question: '_____ participants have requested a vegetarian meal for the upcoming conference.',
              optionA: 'A great deal of',
              optionB: 'A number of',
              optionC: 'The number of',
              optionD: 'Much',
              correctOption: 'B',
              explanation: '"Participants" là danh từ số nhiều. "A number of" + N(số nhiều) + V(số nhiều). "A great deal of" và "Much" dùng cho N(không đếm được).',
              translation: 'Một số lượng lớn người tham gia đã yêu cầu một bữa ăn chay cho hội nghị sắp tới.',
              tips: 'A number of + N(số nhiều) + V(số nhiều) = Nhiều.'
            }
          ]
        }
      ]
    },
    // 2. Các thì Hiện tại
    {
      titleBase: 'Các thì Hiện tại',
      slugBase: 'cac-thi-hien-tai',
      subtitle: 'Hiện tại đơn, hiện tại tiếp diễn, hiện tại hoàn thành.',
      part: 5,
      levels: [
        {
          levelName: 'Cơ Bản',
          questions: [
            {
              question: 'The CEO usually _____ the factory on the first Monday of the month.',
              optionA: 'visit',
              optionB: 'visits',
              optionC: 'visiting',
              optionD: 'is visiting',
              correctOption: 'B',
              explanation: 'Dấu hiệu "usually" (thường xuyên) chỉ thói quen -> Hiện tại đơn. Chủ ngữ "The CEO" (ngôi thứ 3 số ít) nên động từ thêm -s.',
              translation: 'Giám đốc điều hành thường đến thăm nhà máy vào thứ Hai đầu tiên của tháng.',
              tips: 'Thấy usually, always, sometimes -> Dùng Hiện tại đơn.'
            },
            {
              question: 'Currently, the marketing team _____ a new promotional campaign.',
              optionA: 'develop',
              optionB: 'develops',
              optionC: 'is developing',
              optionD: 'developed',
              correctOption: 'C',
              explanation: 'Dấu hiệu "Currently" (Hiện tại đang) -> Hiện tại tiếp diễn (am/is/are + V-ing). "the marketing team" số ít -> is developing.',
              translation: 'Hiện tại, đội ngũ tiếp thị đang phát triển một chiến dịch khuyến mãi mới.',
              tips: 'Currently, now, at the moment -> Hiện tại tiếp diễn.'
            }
          ]
        },
        {
          levelName: 'Trung Cấp',
          questions: [
            {
              question: 'Our company _____ its headquarters in downtown Tokyo since 1995.',
              optionA: 'has had',
              optionB: 'have had',
              optionC: 'had',
              optionD: 'is having',
              correctOption: 'A',
              explanation: 'Dấu hiệu "since 1995" -> Hiện tại hoàn thành. Chủ ngữ "Our company" (số ít) -> has had.',
              translation: 'Công ty chúng tôi đã đặt trụ sở chính tại trung tâm Tokyo kể từ năm 1995.',
              tips: 'Since + mốc thời gian / For + khoảng thời gian -> Hiện tại hoàn thành.'
            },
            {
              question: 'Mr. Lee _____ to the manager yet, but he plans to do so this afternoon.',
              optionA: 'did not speak',
              optionB: 'does not speak',
              optionC: 'is not speaking',
              optionD: 'has not spoken',
              correctOption: 'D',
              explanation: 'Dấu hiệu "yet" (chưa) thường dùng trong câu phủ định của thì Hiện tại hoàn thành.',
              translation: 'Ông Lee vẫn chưa nói chuyện với người quản lý, nhưng ông ấy dự định làm thế vào chiều nay.',
              tips: 'Yet thường nằm cuối câu phủ định của thì Hiện tại hoàn thành.'
            }
          ]
        },
        {
          levelName: 'Nâng Cao',
          questions: [
            {
              question: 'The board of directors _____ the proposed budget for three hours.',
              optionA: 'discusses',
              optionB: 'is discussing',
              optionC: 'has been discussing',
              optionD: 'has discussed',
              correctOption: 'C',
              explanation: 'Dấu hiệu "for three hours" -> Hiện tại hoàn thành hoặc Hiện tại hoàn thành tiếp diễn. Nhấn mạnh quá trình kéo dài liên tục đến hiện tại nên dùng Hiện tại hoàn thành tiếp diễn.',
              translation: 'Hội đồng quản trị đã và đang thảo luận về ngân sách đề xuất trong suốt ba giờ.',
              tips: 'for/since + khoảng/mốc thời gian, nhấn mạnh tính liên tục -> Hiện tại HT tiếp diễn.'
            },
            {
              question: 'By the time I arrive at the office, my assistant _____ the mail.',
              optionA: 'already opens',
              optionB: 'has already opened',
              optionC: 'is already opening',
              optionD: 'already opened',
              correctOption: 'B',
              explanation: 'Thực chất đây là sự việc xảy ra trước 1 thời điểm ở HT/Tương lai, do mệnh đề By the time chia HTĐ, mệnh đề kia có thể chia HTHT hoặc Tương lai hoàn thành. Ở đây "has already opened" diễn tả việc đã hoàn tất tính tới thời điểm hiện tại.',
              translation: 'Vào lúc tôi đến văn phòng, trợ lý của tôi đã mở xong thư từ.',
              tips: 'By the time + HTĐ, mệnh đề chính chia TLHT hoặc HTHT.'
            }
          ]
        }
      ]
    },
    // 3. Các thì Quá khứ & Tương lai
    {
      titleBase: 'Các thì Quá khứ & Tương lai',
      slugBase: 'cac-thi-qua-khu-tuong-lai',
      subtitle: 'Quá khứ đơn, quá khứ tiếp diễn, tương lai đơn.',
      part: 5,
      levels: [
        {
          levelName: 'Cơ Bản',
          questions: [
            {
              question: 'Ms. Jenkins _____ the financial report to the client yesterday afternoon.',
              optionA: 'send',
              optionB: 'sends',
              optionC: 'sent',
              optionD: 'sending',
              correctOption: 'C',
              explanation: 'Dấu hiệu "yesterday afternoon" -> Quá khứ đơn. Dạng quá khứ của "send" là "sent".',
              translation: 'Bà Jenkins đã gửi báo cáo tài chính cho khách hàng vào chiều hôm qua.',
              tips: 'Yesterday, last week, ago -> Quá khứ đơn.'
            },
            {
              question: 'The new software _____ available for download next Monday.',
              optionA: 'will be',
              optionB: 'is being',
              optionC: 'was',
              optionD: 'has been',
              correctOption: 'A',
              explanation: 'Dấu hiệu "next Monday" -> Tương lai đơn (will + V-nguyên thể).',
              translation: 'Phần mềm mới sẽ có sẵn để tải về vào thứ Hai tới.',
              tips: 'Next week, tomorrow, in the future -> Tương lai đơn.'
            }
          ]
        },
        {
          levelName: 'Trung Cấp',
          questions: [
            {
              question: 'While I _____ the document, the power suddenly went out.',
              optionA: 'printed',
              optionB: 'was printing',
              optionC: 'had printed',
              optionD: 'am printing',
              correctOption: 'B',
              explanation: 'Hành động đang xảy ra trong quá khứ (Quá khứ tiếp diễn - was printing) thì có hành động khác xen vào (Quá khứ đơn - went out).',
              translation: 'Trong khi tôi đang in tài liệu thì mất điện đột ngột.',
              tips: 'While + Quá khứ tiếp diễn, mệnh đề còn lại Quá khứ đơn (nếu xen vào).'
            },
            {
              question: 'Before Ms. Smith joined our firm, she _____ for a rival company.',
              optionA: 'works',
              optionB: 'has worked',
              optionC: 'had worked',
              optionD: 'is working',
              correctOption: 'C',
              explanation: 'Hành động xảy ra trước một hành động khác trong quá khứ (joined) -> Quá khứ hoàn thành (had worked).',
              translation: 'Trước khi bà Smith gia nhập công ty chúng tôi, bà ấy đã làm việc cho một công ty đối thủ.',
              tips: 'Before + Quá khứ đơn, mệnh đề chính Quá khứ hoàn thành.'
            }
          ]
        },
        {
          levelName: 'Nâng Cao',
          questions: [
            {
              question: 'By this time next year, the construction of the new bridge _____ completely.',
              optionA: 'will finish',
              optionB: 'will be finishing',
              optionC: 'will have finished',
              optionD: 'will have been finished',
              correctOption: 'D',
              explanation: 'Dấu hiệu "By this time next year" -> Tương lai hoàn thành (will have + V3/ed). Hơn nữa, chủ ngữ "the construction" mang nghĩa bị động -> will have been + V3/ed.',
              translation: 'Vào thời điểm này năm tới, việc xây dựng cây cầu mới sẽ được hoàn thành hoàn toàn.',
              tips: 'By + thời điểm tương lai -> Tương lai hoàn thành. Chú ý cấu trúc bị động.'
            },
            {
              question: 'No sooner _____ the conference room than the presentation began.',
              optionA: 'he had entered',
              optionB: 'had he entered',
              optionC: 'he entered',
              optionD: 'did he enter',
              correctOption: 'B',
              explanation: 'Cấu trúc đảo ngữ "No sooner + had + S + V3/ed + than + S + V2/ed". Đảo trợ động từ "had" lên trước chủ ngữ.',
              translation: 'Anh ấy vừa mới bước vào phòng hội nghị thì bài thuyết trình bắt đầu.',
              tips: 'No sooner ... than ... = Vừa mới ... thì ... (Đảo ngữ Quá khứ hoàn thành).'
            }
          ]
        }
      ]
    },
    // 4. Sự hòa hợp giữa Chủ ngữ và Động từ
    {
      titleBase: 'Sự hòa hợp Chủ - Vị',
      slugBase: 'su-hoa-hop-chu-vi',
      subtitle: 'Quy tắc Subject-Verb Agreement thường gặp.',
      part: 5,
      levels: [
        {
          levelName: 'Cơ Bản',
          questions: [
            {
              question: 'Every student _____ a copy of the textbook by the end of the week.',
              optionA: 'receive',
              optionB: 'receives',
              optionC: 'receiving',
              optionD: 'are receiving',
              correctOption: 'B',
              explanation: 'Chủ ngữ bắt đầu bằng "Every", "Each" luôn đi với động từ số ít.',
              translation: 'Mỗi học sinh sẽ nhận được một bản sao của sách giáo khoa vào cuối tuần.',
              tips: 'Every/Each + Danh từ số ít + Động từ số ít.'
            },
            {
              question: 'Mathematics _____ a difficult subject for many high school students.',
              optionA: 'is',
              optionB: 'are',
              optionC: 'be',
              optionD: 'were',
              correctOption: 'A',
              explanation: '"Mathematics" (Toán học) là danh từ chỉ môn học, dù có tận cùng là "s" nhưng nó luôn là danh từ số ít.',
              translation: 'Toán học là một môn học khó đối với nhiều học sinh trung học.',
              tips: 'Tên môn học (Physics, Economics, Mathematics) chia động từ số ít.'
            }
          ]
        },
        {
          levelName: 'Trung Cấp',
          questions: [
            {
              question: 'Neither the manager nor the employees _____ informed about the upcoming policy changes.',
              optionA: 'was',
              optionB: 'were',
              optionC: 'has',
              optionD: 'is',
              correctOption: 'B',
              explanation: 'Cấu trúc "Neither S1 nor S2", động từ chia theo chủ ngữ gần nó nhất (S2). "the employees" là số nhiều -> were.',
              translation: 'Cả người quản lý lẫn nhân viên đều không được thông báo về những thay đổi chính sách sắp tới.',
              tips: 'Either/Neither S1 or/nor S2 + V(chia theo S2).'
            },
            {
              question: 'The number of applicants for the position _____ significantly since last month.',
              optionA: 'has increased',
              optionB: 'have increased',
              optionC: 'is increasing',
              optionD: 'are increasing',
              correctOption: 'A',
              explanation: '"The number of" (số lượng của) luôn đi với danh từ số nhiều nhưng ĐỘNG TỪ chia ở số ÍT. Phân biệt với "A number of" (nhiều) + V số nhiều.',
              translation: 'Số lượng người ứng tuyển cho vị trí này đã tăng đáng kể kể từ tháng trước.',
              tips: 'The number of + N(số nhiều) + V(số ít).'
            }
          ]
        },
        {
          levelName: 'Nâng Cao',
          questions: [
            {
              question: 'The committee, along with the CEO, _____ attending the annual gala tonight.',
              optionA: 'are',
              optionB: 'is',
              optionC: 'were',
              optionD: 'have been',
              correctOption: 'B',
              explanation: 'Khi chủ ngữ 1 kết nối với chủ ngữ 2 bằng "along with", "together with", "as well as", động từ luôn chia theo CHỦ NGỮ 1. "The committee" (xem như 1 tập thể thống nhất) -> is.',
              translation: 'Ủy ban, cùng với Giám đốc điều hành, đang tham dự buổi tiệc thường niên vào tối nay.',
              tips: 'S1 along with/as well as S2 -> V chia theo S1.'
            },
            {
              question: 'Ten thousand dollars _____ considered a substantial amount of money to invest in this project.',
              optionA: 'are',
              optionB: 'were',
              optionC: 'is',
              optionD: 'have been',
              correctOption: 'C',
              explanation: 'Các danh từ chỉ khoảng thời gian, số tiền, khoảng cách... dù ở dạng số nhiều nhưng luôn được xem là 1 tổng thể -> dùng động từ số ít.',
              translation: 'Mười nghìn đô la được xem là một khoản tiền lớn để đầu tư vào dự án này.',
              tips: 'Số lượng (thời gian, tiền bạc, khoảng cách) + Động từ số ít.'
            }
          ]
        }
      ]
    },
    // 5. Đại từ
    {
      titleBase: 'Đại từ',
      slugBase: 'dai-tu',
      subtitle: 'Đại từ nhân xưng, tính từ sở hữu, đại từ phản thân.',
      part: 5,
      levels: [
        {
          levelName: 'Cơ Bản',
          questions: [
            {
              question: 'Mr. Harris told _____ that the meeting had been postponed until Friday.',
              optionA: 'we',
              optionB: 'us',
              optionC: 'our',
              optionD: 'ours',
              correctOption: 'B',
              explanation: 'Sau động từ "told" cần một đại từ làm tân ngữ. "we" là chủ ngữ, "our" là tính từ sở hữu. Đáp án đúng là "us".',
              translation: 'Ông Harris bảo chúng tôi rằng cuộc họp đã bị hoãn lại cho đến thứ Sáu.',
              tips: 'Động từ + Đại từ làm tân ngữ (me, you, him, her, it, us, them).'
            },
            {
              question: 'Please sign _____ name at the bottom of the contract.',
              optionA: 'you',
              optionB: 'yours',
              optionC: 'your',
              optionD: 'yourself',
              correctOption: 'C',
              explanation: 'Trước danh từ "name" cần một tính từ sở hữu. Đáp án đúng là "your".',
              translation: 'Vui lòng ký tên của bạn ở dưới cùng của hợp đồng.',
              tips: 'Tính từ sở hữu + Danh từ.'
            }
          ]
        },
        {
          levelName: 'Trung Cấp',
          questions: [
            {
              question: 'The employees prepared for the presentation all by _____.',
              optionA: 'they',
              optionB: 'them',
              optionC: 'their',
              optionD: 'themselves',
              correctOption: 'D',
              explanation: 'Cụm từ "by oneself" (tự mình làm việc gì đó). Chủ ngữ là "The employees" (số nhiều) -> by themselves.',
              translation: 'Các nhân viên đã tự mình chuẩn bị cho buổi thuyết trình.',
              tips: 'by oneself = tự mình. Dựa vào chủ ngữ để chọn đại từ phản thân tương ứng.'
            },
            {
              question: 'This department has higher productivity than _____ in the other building.',
              optionA: 'that',
              optionB: 'those',
              optionC: 'this',
              optionD: 'them',
              correctOption: 'A',
              explanation: 'Đại từ chỉ định thay thế cho danh từ số ít "department" phía trước để tránh lặp từ là "that". Nếu danh từ số nhiều thì dùng "those".',
              translation: 'Bộ phận này có năng suất cao hơn bộ phận ở tòa nhà khác.',
              tips: 'Dùng "that of" thay cho N(số ít) và "those of" thay cho N(số nhiều).'
            }
          ]
        },
        {
          levelName: 'Nâng Cao',
          questions: [
            {
              question: 'The CEO _____ will announce the quarterly financial results at the meeting.',
              optionA: 'he',
              optionB: 'himself',
              optionC: 'his',
              optionD: 'him',
              correctOption: 'B',
              explanation: 'Đại từ phản thân đứng ngay sau danh từ (chủ ngữ) hoặc cuối câu để nhấn mạnh chính người đó làm việc gì. "The CEO himself" = chính Giám đốc.',
              translation: 'Chính giám đốc điều hành sẽ công bố kết quả tài chính hàng quý tại cuộc họp.',
              tips: 'Đại từ phản thân làm chức năng nhấn mạnh đứng ngay sau danh từ/đại từ nó bổ nghĩa.'
            },
            {
              question: 'Those _____ wish to apply for the position must submit their resumes by Friday.',
              optionA: 'who',
              optionB: 'whom',
              optionC: 'which',
              optionD: 'they',
              correctOption: 'A',
              explanation: 'Cấu trúc "Those who" (Những người mà...). Đứng trước động từ "wish", cần một đại từ quan hệ làm chủ ngữ chỉ người -> "who".',
              translation: 'Những người muốn ứng tuyển vị trí này phải nộp sơ yếu lý lịch trước thứ Sáu.',
              tips: 'Those who + V = Những người mà...'
            }
          ]
        }
      ]
    }
  ];

  for (const topicData of dataToInsert) {
    for (const levelData of topicData.levels) {
      const topicTitle = `${topicData.titleBase}`;
      const levelSlug = levelData.levelName === 'Cơ Bản' ? 'co-ban' : levelData.levelName === 'Trung Cấp' ? 'trung-cap' : 'nang-cao';
      const fullSlug = `${topicData.slugBase}-${levelSlug}`;

      // Check if topic exists
      const existingTopic = await prisma.toeicGrammarTopic.findFirst({
        where: { slug: fullSlug }
      });

      if (existingTopic) {
        console.log(`Topic already exists, skipping: ${fullSlug}`);
        continue;
      }

      // Create Topic
      const createdTopic = await prisma.toeicGrammarTopic.create({
        data: {
          title: topicTitle,
          subtitle: topicData.subtitle,
          slug: fullSlug,
          level: levelData.levelName,
          type: 'GRAMMAR',
          part: topicData.part
        }
      });

      // Create Lesson
      const lesson = await prisma.toeicGrammarLesson.create({
        data: {
          topicId: createdTopic.id,
          title: `Bài tập: ${topicTitle} (${levelData.levelName})`,
          order: 1,
          accessTier: 'FREE',
        }
      });

      // Create Questions
      for (const q of levelData.questions) {
        await prisma.toeicQuestion.create({
          data: {
            lessonId: lesson.id,
            question: q.question,
            optionA: q.optionA,
            optionB: q.optionB,
            optionC: q.optionC,
            optionD: q.optionD,
            correctOption: q.correctOption,
            explanation: q.explanation,
            translation: q.translation,
            tips: q.tips
          }
        });
      }

      console.log(`Created Topic & Questions for: ${fullSlug}`);
    }
  }

  console.log('Phase 1 insertion completed successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
