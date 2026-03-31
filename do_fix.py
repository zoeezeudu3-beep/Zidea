import re

with open("index.html", "rb") as f:
    raw = f.read()

# The file is stored as UTF-8 but contains mojibake (UTF-8 bytes interpreted as latin-1 then re-encoded)
# Decode as latin-1 to get the raw characters, then apply fixes
html = raw.decode("latin-1")

# All replacements - exact mojibake sequences to clean ASCII/English
fixes = [
    # Punctuation
    ("â€"", "-"),
    ("Â©", "(c)"),
    ("â"€", "-"),
    # Box drawing sequences (â• followed by more â•)
    ("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•", "================================"),
    ("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•", "======================================"),
    ("â•", "="),
    # Replacement char
    ("ï¿½", ""),
    # Emojis
    ("ðŸš¨", "[!]"),
    ("ðŸ"ª", "[knife]"),
    ("ðŸ§'â€ðŸš€", "[crew]"),
    ("ðŸ¤–", "[bot]"),
    ("ðŸ'¤", "[you]"),
    ("ðŸ'¥", "[friends]"),
    ("ðŸ†", "[trophy]"),
    ("ðŸ'€", "[skull]"),
    ("ðŸŽ®", "[game]"),
    ("ðŸŽ™ï¸", "[mic]"),
    ("ðŸš€", "[rocket]"),
    ("ðŸ—³ï¸", "[vote]"),
    ("ðŸ"¢", "[report]"),
    ("ðŸ¤", "[deal]"),
    ("ðŸŽ‰", "[party]"),
    ("ðŸ''", "[crown]"),
    ("ðŸ"'", "[lock]"),
    ("ðŸ"§", "[email]"),
    ("ðŸ"", "[search]"),
    ("ðŸ"ž", "[call]"),
    ("ðŸ"µ", "[end-call]"),
    ("ðŸ'¬", "[chat]"),
    ("ðŸ'‹", "[hi]"),
    ("ðŸ¤"", "[hmm]"),
    ("ðŸ˜‚", ":D"),
    ("ðŸ'€", "[eyes]"),
    ("ðŸ™Œ", "[hands]"),
    ("ðŸ'Œ", "[ok]"),
    ("ðŸ¤£", "lol"),
    ("ðŸ™‚", ":)"),
    ("ðŸ'", "[thumbsup]"),
    ("ðŸ'Ž", "[thumbsdown]"),
    ("ðŸ"¥", "[fire]"),
    ("ðŸ'¡", "[idea]"),
    ("ðŸ'°", "[money]"),
    ("ðŸ"±", "[phone]"),
    ("ðŸ'»", "[pc]"),
    ("ðŸ"", "[camera]"),
    ("ðŸŽµ", "[music]"),
    ("ðŸŽ¯", "[target]"),
    ("ðŸŽ²", "[dice]"),
    ("ðŸ€", "[clover]"),
    ("ðŸ'¾", "[alien]"),
    ("ðŸ'£", "[bomb]"),
    ("ðŸ'Š", "[punch]"),
    ("âœ…", "[done]"),
    ("âŒ", "[x]"),
    ("â—", "[!]"),
    ("â"", "[?]"),
    ("â­•", "[o]"),
    ("â­", "[star]"),
    ("â¬", "[back]"),
    ("â¬œ", "[yellow]"),
    ("â¬›", "[black]"),
    ("â–¶ï¸", "[play]"),
    ("â—€ï¸", "[back]"),
    ("â–¶", "[play]"),
    ("â—€", "[back]"),
    ("â–²", "[up]"),
    ("â–¼", "[down]"),
    ("â­", "[skip]"),
    ("â®", "[prev]"),
    ("â¯", "[pause]"),
    ("â°", "[timer]"),
    # Chess pieces - keep as unicode chess symbols (they render fine)
    # but the mojibake versions need fixing
    ("â™"", "\u2654"),
    ("â™•", "\u2655"),
    ("â™–", "\u2656"),
    ("â™—", "\u2657"),
    ("â™˜", "\u2658"),
    ("â™™", "\u2659"),
    ("â™š", "\u265A"),
    ("â™›", "\u265B"),
    ("â™œ", "\u265C"),
    ("â™", "\u265D"),
    ("â™ž", "\u265E"),
    ("â™Ÿ", "\u265F"),
    # RPS / game emojis
    ("âœŠ", "[fist]"),
    ("ðŸ–ï¸", "[hand]"),
    ("âœŒï¸", "[scissors]"),
    ("âœŒ", "[scissors]"),
    # Online status dots
    ("â—", "[online]"),
    ("â—‹", "[offline]"),
    # Arrow back
    ("â†", "<-"),
    # Chess board status
    ("â¬œ", "[yellow]"),
    ("â¬›", "[black]"),
    # Skull (duplicate of eyes - different emoji)
    # Note: ðŸ'€ appears twice in the list (skull AND eyes) - handle carefully
    # The user says ðŸ'€ -> [skull] and ðŸ'€ -> [eyes]
    # In mojibake these are different sequences - already handled above
    # Game picker emojis
    ("â™Ÿï¸", "[chess]"),
]

for old, new in fixes:
    html = html.replace(old, new)

# Remove any remaining replacement chars or stray high bytes that are clearly garbage
# (sequences starting with ð that weren't matched)
html = re.sub(r'ðŸ[^\s<>"\'`]*', '', html)
html = re.sub(r'Ã[^\s<>"\'`]', '', html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Done!")
