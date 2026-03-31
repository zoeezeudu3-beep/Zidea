import re

with open("index.html", "rb") as f:
    raw = f.read()

# The file has mojibake: UTF-8 multibyte sequences were stored as latin-1 codepoints
# then re-encoded as UTF-8. Fix by decoding as UTF-8, then for each "broken" run
# re-encode as latin-1 and decode as UTF-8.

text = raw.decode("utf-8")

# Replace known broken sequences with correct Unicode
replacements = [
    # Title / prose dashes
    ("â€"", "—"),
    ("â€"", "–"),
    ("â€™", "'"),
    ("â€œ", "\u201c"),
    ("â€\u009d", "\u201d"),
    ("â€¦", "…"),
    ("Â ", "\u00a0"),
    # Emoji mojibake patterns (UTF-8 bytes misread as latin-1)
    ("ðŸš¨", "🚨"),
    ("ðŸ"ª", "🔪"),
    ("ðŸ§\u2019â€ðŸš€", "🧑\u200d🚀"),
    ("ðŸ§'â€ðŸš€", "🧑\u200d🚀"),
    ("ðŸ§â€ðŸš€", "🧑\u200d🚀"),
    ("ðŸ'¥", "👥"),
    ("ðŸ'¤", "👤"),
    ("ðŸ¤–", "🤖"),
    ("ðŸŽ™ï¸", "🎙️"),
    ("ðŸŽ®", "🎮"),
    ("ðŸš€", "🚀"),
    ("ðŸ†", "🏆"),
    ("ðŸ'€", "💀"),
    ("ðŸ"ž", "📞"),
    ("ðŸ"µ", "📵"),
    ("ðŸ'¬", "💬"),
    ("ðŸ¤"", "🤔"),
    ("ðŸ¤", "🤝"),
    ("ðŸŽ‰", "🎉"),
    ("ðŸ–ï¸", "🖐️"),
    ("âœŠ", "✊"),
    ("âœŒï¸", "✌️"),
    ("âœ…", "✅"),
    ("ðŸ"¢", "📢"),
    ("â­", "⏭"),
    ("ðŸ—³ï¸", "🗳️"),
    ("ðŸ'Œ", "👌"),
    ("ðŸ˜‚", "😂"),
    ("ðŸ˜¢", "😢"),
    ("ðŸ™", "🙏"),
    ("â™Ÿï¸", "♟️"),
    ("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•", "════════════════════════════════"),
    ("â•", "═"),
    ("â"€â"€", "──"),
    ("â"€", "─"),
]

for bad, good in replacements:
    text = text.replace(bad, good)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(text)

print("Done")
