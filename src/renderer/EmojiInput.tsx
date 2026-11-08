const commonEmojis = [
  "😀", "😂", "😍", "🤔", "😎", "🥳", "😭", "👍", "🙏", "🔥",
  "💯", "🎉", "❤️", "✨", "💀", "🤖", "🐱", "🐶", "🍕", "☕"
];

export function EmojiInput({
  emoji,
  onEmojiChange
}: {
  emoji: string;
  onEmojiChange: (emoji: string) => void;
}): React.JSX.Element {
  return (
    <span className="emoji-input">
      <input
        aria-label="Assigned emoji"
        value={emoji}
        maxLength={4}
        placeholder="🙂"
        onChange={(event) => onEmojiChange(event.target.value)}
      />
      <select
        aria-label="Pick emoji"
        value=""
        onChange={(event) => {
          if (event.target.value !== "") {
            onEmojiChange(event.target.value);
          }
        }}
      >
        <option value="">＋</option>
        {commonEmojis.map((candidate) => (
          <option key={candidate} value={candidate}>
            {candidate}
          </option>
        ))}
      </select>
    </span>
  );
}
