import type { WordCard as WordCardType } from "@/data/content";

export function WordCard({ card }: { card: WordCardType }) {
  return (
    <figure className="word-card">
      <div className="word-card-syllables">
        {card.syllables.map((s) => (
          <span key={s}>{s}</span>
        ))}
      </div>
      <div className="word-card-emoji" aria-hidden="true">
        {card.emoji}
      </div>
      <figcaption className="word-card-word">{card.word}</figcaption>
    </figure>
  );
}
