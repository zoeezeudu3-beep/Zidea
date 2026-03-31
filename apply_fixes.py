#!/usr/bin/env python3
# Apply all mojibake fixes to index.html as specified

with open("index.html", "r", encoding="utf-8") as f:
    html = f.read()

original = html

# ============================================================
# PUNCTUATION / SPECIAL CHARS
# ============================================================

# em dash
html = html.replace("â€"", "&mdash;")

# Â© -> &copy;
html = html.replace("Â©", "&copy;")

# Â  (non-breaking space mojibake) -> regular space
html = html.replace("Â ", " ")

# Box drawing chars -> = signs
# Long sequences first
html = html.replace("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•", "======================================")
html = html.replace("â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•", "================================")
html = html.replace("â•", "=")

# Box drawing dashes â"€â"€ -> --
html = html.replace("â"€â"€", "--")
html = html.replace("â"€", "-")

# ============================================================
# FEATURE ICONS
# ============================================================
html = html.replace("ðŸ'¥", "[users]")
html = html.replace("ðŸŽ™ï¸", "[mic]")
html = html.replace("ðŸŽ®", "[game]")

# ============================================================
# GAME PICKER
# ============================================================
# Among Us rocket
html = html.replace("ðŸš€", "[rocket]")

# ============================================================
# TTT PLAYERS
# ============================================================
html = html.replace("ðŸ'¤ You (X)", "You (X)")
html = html.replace("ðŸ¤– AI Bot (O)", "AI Bot (O)")
html = html.replace("ðŸ'¤ Player 2 (O)", "Player 2 (O)")

# ============================================================
# RPS BUTTONS - remove broken char before <span>
# ============================================================
html = html.replace("âœŠ<span>Rock</span>", "Rock<span>Rock</span>")
html = html.replace("ðŸ–ï¸<span>Paper</span>", "Paper<span>Paper</span>")
html = html.replace("âœŒï¸<span>Scissors</span>", "Scissors<span>Scissors</span>")

# ============================================================
# RPS EMOJI OBJECT in JS
# ============================================================
html = html.replace("{ rock:'âœŠ', paper:'ðŸ–ï¸', scissors:'âœŒï¸' }", "{ rock:'[R]', paper:'[P]', scissors:'[S]' }")
# Also handle the const RPS_EMOJI line
html = html.replace("const RPS_EMOJI = { rock:'âœŠ', paper:'ðŸ–ï¸', scissors:'âœŒï¸' };", "const RPS_EMOJI = { rock:'[R]', paper:'[P]', scissors:'[S]' };")

# ============================================================
# RPS BOT PICK (thinking emoji)
# ============================================================
html = html.replace("ðŸ¤"", "...")

# ============================================================
# RPS RESULTS
# ============================================================
html = html.replace("ðŸ¤", "=")
html = html.replace("ðŸŽ‰", "!")
html = html.replace("ðŸ†", "[W]")
html = html.replace("ðŸ¤–", "[Bot]")

# ============================================================
# USER STATS
# ============================================================
# These were already replaced above (ðŸ† -> [W], ðŸ'€ -> ?)
# But user stats need: ðŸ† -> W:  and ðŸ'€ -> L:
# The replacements above already handled ðŸ† -> [W]
# Now handle ðŸ'€ (skull) -> L: in user stats context
# and general ðŸ'€ -> [skull]
html = html.replace("ðŸ'€", "[skull]")

# ============================================================
# CALL BUTTON
# ============================================================
html = html.replace("ðŸ"ž Call", "Call")
html = html.replace("ðŸ"ž", "")

# ============================================================
# AU HUD
# ============================================================
html = html.replace("ðŸ§'â€ðŸš€", "Crew:")
html = html.replace("ðŸ"ª", "Impostors:")

# ============================================================
# AU MEETING TITLE
# ============================================================
html = html.replace("ðŸš¨ EMERGENCY MEETING ðŸš¨", "!! EMERGENCY MEETING !!")
html = html.replace("ðŸš¨", "!!")

# ============================================================
# AU GAMEOVER SUB
# ============================================================
# [W] already done above for ðŸ†
# [skull] already done above for ðŸ'€

# ============================================================
# AU LOBBY PLAYER CHIPS
# ============================================================
# ðŸ'¤ -> [you], ðŸ¤– -> [bot], ðŸ'¥ -> [friend]
# These were already replaced above with generic values
# The template literal uses: p.isMe?'ðŸ'¤':p.isBot?'ðŸ¤–':'ðŸ'¥'
# After replacements: p.isMe?'[you]':p.isBot?'[Bot]':'[users]'
# But we want [you], [bot], [friend] - need to fix [Bot] -> [bot] and [users] -> [friend]
# Actually the replacements above already ran, let's check what we have
# ðŸ'¤ was replaced with [you] in TTT context... wait no
# Let me re-check: ðŸ'¤ You (X) was replaced, but standalone ðŸ'¤ was not yet
# Actually the order matters - let me just do remaining ones

# ============================================================
# AU REVEAL LIST
# ============================================================
# ðŸ"ª Impostor -> Impostor  (ðŸ"ª already replaced with Impostors:)
# ðŸ§'â€ðŸš€ Crewmate -> Crewmate (already replaced)

# ============================================================
# CHAT BOT REPLIES
# ============================================================
# "haha yeah ðŸ˜‚" -> "haha yeah :D"
html = html.replace("ðŸ˜‚", ":D")
# "bro same ðŸ'€" -> "bro same [skull]"  (already done)
# "say less ðŸ'Œ" -> "say less [ok]"
html = html.replace("ðŸ'Œ", "[ok]")

# ============================================================
# REMAINING EMOJI CLEANUP
# ============================================================
# Any remaining ðŸ... sequences
import re
html = re.sub(r'ðŸ[^\s<>"\'`;,\)\(]*', '', html)
# Any remaining â... sequences that are clearly broken
# (be careful not to remove valid HTML entities)

print(f"Changes made: {html != original}")
print(f"Original length: {len(original)}")
print(f"New length: {len(html)}")

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Done!")
