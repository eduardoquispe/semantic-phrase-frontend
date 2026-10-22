export interface PhraseListItemData {
  readonly text: string
  readonly dateTime: string
  readonly dateLabel: string
}

export interface PhraseListItemProps {
  readonly phrase: PhraseListItemData
}
