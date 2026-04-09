const getFirstValue = (map, keys) => {
  for (const key of keys) {
    const value = String(map.get(key) || '').trim()
    if (value) {
      return value
    }
  }
  return ''
}

const parseVocabularyFromText = (text) => {
  const normalizedText = String(text || '').replace(/\r/g, '\n')
  const lines = normalizedText.split('\n').map((line) => line.trim())
  const parsedItems = []
  let invalidCount = 0

  const currentMap = new Map()

  const flushCurrentItem = () => {
    if (currentMap.size === 0) {
      return
    }

    const word = getFirstValue(currentMap, ['WORD'])
    const meaning = getFirstValue(currentMap, ['MEANING'])
    const topic = getFirstValue(currentMap, ['TOPIC']) || 'WarmUp'

    if (!word || !meaning) {
      invalidCount += 1
      currentMap.clear()
      return
    }

    parsedItems.push({
      word,
      meaning,
      topic
    })

    currentMap.clear()
  }

  for (const line of lines) {
    if (!line) continue

    const separatorIndex = line.indexOf(':')
    if (separatorIndex <= 0) continue

    const key = line
      .slice(0, separatorIndex)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')
    const value = line.slice(separatorIndex + 1).trim()
    if (!value) continue

    if ((key === 'WORD' || key === 'TOPIC') && (currentMap.has('WORD') || currentMap.has('TOPIC'))) {
      if (key === 'WORD' && currentMap.has('WORD')) {
        flushCurrentItem()
      } else if (key === 'TOPIC' && currentMap.has('TOPIC')) {
        flushCurrentItem()
      } else if (key === 'TOPIC' && currentMap.has('WORD')) {
         flushCurrentItem()
      }
    }

    if (!currentMap.has(key)) {
      currentMap.set(key, value)
    }
  }

  flushCurrentItem()

  return { parsedItems, invalidCount }
}

const text = `TOPIC: Travelling
WORD: embark
PHONETIC: /ɪmˈbɑːrk/
PART_OF_SPEECH: verb
ENGLISH_DEFINITION: To get onto a ship, an aircraft, or a bus.
MEANING: lên tàu/máy bay
EXAMPLE: Passengers are waiting to embark on the cruise ship.

TOPIC: Travelling
WORD: experience
PHONETIC: /ɪkˈspɪəriəns/
PART_OF_SPEECH: noun/verb
ENGLISH_DEFINITION: To have something happen to you; to do or feel something.
MEANING: trải nghiệm, kinh nghiệm
EXAMPLE: Traveling to a new country is a wonderful experience.`

console.log(JSON.stringify(parseVocabularyFromText(text), null, 2))
