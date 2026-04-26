import { Fragment } from 'react'

interface LinkifiedTextProps {
  text: string
  preserveLineBreaks?: boolean
  linkClassName?: string
}

const URL_PATTERN = /((?:https?:\/\/|www\.)[^\s]+)/gi

const trimTrailingPunctuation = (value: string) => {
  let trimmed = value
  let trailingText = ''

  while (trimmed.length > 0) {
    const lastCharacter = trimmed.at(-1)
    if (!lastCharacter || !'.,!?;:)]}'.includes(lastCharacter)) {
      break
    }

    if (lastCharacter === ')') {
      const openingCount = (trimmed.match(/\(/g) || []).length
      const closingCount = (trimmed.match(/\)/g) || []).length
      if (closingCount <= openingCount) {
        break
      }
    }

    trailingText = `${lastCharacter}${trailingText}`
    trimmed = trimmed.slice(0, -1)
  }

  return { trimmed, trailingText }
}

const isUrlToken = (value: string) => /^(?:https?:\/\/|www\.)/i.test(value)

const toHref = (value: string) => (value.startsWith('www.') ? `https://${value}` : value)

const renderTextWithLinks = (text: string, linkClassName: string) => {
  const parts = text.split(URL_PATTERN)

  return parts.map((part, index) => {
    if (!part) {
      return null
    }

    if (!isUrlToken(part)) {
      return <Fragment key={`text-${index}`}>{part}</Fragment>
    }

    const { trimmed, trailingText } = trimTrailingPunctuation(part)
    if (!trimmed) {
      return <Fragment key={`text-${index}`}>{part}</Fragment>
    }

    return (
      <Fragment key={`link-${index}`}>
        <a
          href={toHref(trimmed)}
          target="_blank"
          rel="noopener noreferrer"
          className={linkClassName}
        >
          {trimmed}
        </a>
        {trailingText ? <Fragment>{trailingText}</Fragment> : null}
      </Fragment>
    )
  })
}

export default function LinkifiedText({
  text,
  preserveLineBreaks = true,
  linkClassName = 'font-medium text-primary-700 underline underline-offset-2 break-all hover:text-primary-800'
}: LinkifiedTextProps) {
  if (!preserveLineBreaks) {
    return <>{renderTextWithLinks(text, linkClassName)}</>
  }

  const lines = text.split(/\r?\n/)

  return (
    <>
      {lines.map((line, index) => {
        const isBoldListHeading = /^\d+\.\s/.test(line.trim())
        
        return (
          <Fragment key={`line-${index}`}>
            {index > 0 ? <br /> : null}
            {isBoldListHeading ? (
              <span className="font-semibold text-slate-900 border-none">
                {renderTextWithLinks(line, linkClassName)}
              </span>
            ) : (
              renderTextWithLinks(line, linkClassName)
            )}
          </Fragment>
        )
      })}
    </>
  )
}