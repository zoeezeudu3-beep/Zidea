import re

with open("index.html", "rb") as f:
    raw = f.read()

# The file was written with double-encoded UTF-8 in some places.
# Decode as latin-1 to see the raw bytes, then fix.
html = raw.decode("utf-8", errors="replace")

# Replace every garbled multi-byte sequence with plain English.
# These are the actual byte patterns that appear as garbled text.
fixes = [
    # Structural / punctuation
    ("\u00e2\u0080\u0094", " - "),   # em dash â€"
    ("\u00c2\u00a9", "(c)"),          # copyright Â©
    ("\u00e2\u0094\u0080", "-"),      # box drawing â"€
    ("\u00e2\u0095\u00bc", "="),      # box drawing â•¼
    ("\u00e2\u0095\u0090", "="),      # box drawing â•
    ("\u00ef\u00bf\u00bd", ""),       # replacement char ï¿½

    # Emojis - replace with readable English labels
    ("\U0001f6a8", "ALERT"),          # 🚨
    ("\U0001f52a", "KNIFE"),          # 🔪
    ("\U0001f9d1\u200d\U0001f680", "CREW"),  # 🧑‍🚀
    ("\U0001f916", "BOT"),            # 🤖
    ("\U0001f464", "YOU"),            # 👤
    ("\U0001f465", "FRIENDS"),        # 👥
    ("\U0001f3c6", "TROPHY"),         # 🏆
    ("\U0001f480", "SKULL"),          # 💀
    ("\U0001f3ae", "GAME"),           # 🎮
    ("\U0001f399\ufe0f", "MIC"),      # 🎙️
    ("\U0001f680", "ROCKET"),         # 🚀
    ("\U0001f5f3\ufe0f", "VOTE"),     # 🗳️
    ("\U0001f4e2", "REPORT"),         # 📢
    ("\U0001f91d", "DEAL"),           # 🤝
    ("\U0001f389", "PARTY"),          # 🎉
    ("\U0001f451", "CROWN"),          # 👑
    ("\U0001f512", "LOCK"),           # 🔒
    ("\U0001f4e7", "EMAIL"),          # 📧
    ("\U0001f50d", "SEARCH"),         # 🔍
    ("\U0001f4de", "CALL"),           # 📞
    ("\U0001f4f5", "END CALL"),       # 📵
    ("\U0001f4ac", "CHAT"),           # 💬
    ("\U0001f44b", "HI"),             # 👋
    ("\U0001f914", "HMMMM"),          # 🤔
    ("\U0001f602", ":D"),             # 😂
    ("\U0001f440", "EYES"),           # 👀
    ("\U0001f64c", "HANDS"),          # 🙌
    ("\U0001f44c", "OK"),             # 👌
    ("\U0001f923", "LOL"),            # 🤣
    ("\U0001f642", ":)"),             # 🙂
    ("\u2705", "DONE"),               # ✅
    ("\u26a0\ufe0f", "WARNING"),      # ⚠️
    ("\u23f9\ufe0f", "SKIP"),         # ⏹️
    ("\u23ed\ufe0f", "SKIP"),         # ⏭️
    ("\u23ed", "SKIP"),               # ⏭
    ("\u2764\ufe0f", "HEART"),        # ❤️
    ("\u2b50", "STAR"),               # ⭐
    ("\u26bd", "BALL"),               # ⚽
    ("\u2694\ufe0f", "SWORDS"),       # ⚔️
    ("\u2699\ufe0f", "GEAR"),         # ⚙️
    ("\u2b07\ufe0f", "DOWN"),         # ⬇️
    ("\u2b06\ufe0f", "UP"),           # ⬆️
    ("\u25b6\ufe0f", "PLAY"),         # ▶️
    ("\u25c0\ufe0f", "BACK"),         # ◀️
    ("\u23f8\ufe0f", "PAUSE"),        # ⏸️
    ("\u23f0", "TIMER"),              # ⏰
    ("\u2714\ufe0f", "CHECK"),        # ✔️
    ("\u274c", "X"),                  # ❌
    ("\u2757", "!"),                  # ❗
    ("\u2753", "?"),                  # ❓
    ("\u2b50\ufe0f", "STAR"),         # ⭐️
    ("\U0001f4a5", "BOOM"),           # 💥
    ("\U0001f525", "FIRE"),           # 🔥
    ("\U0001f4a1", "IDEA"),           # 💡
    ("\U0001f4a4", "ZZZ"),            # 💤
    ("\U0001f4a8", "DASH"),           # 💨
    ("\U0001f4a6", "SWEAT"),          # 💦
    ("\U0001f4a9", "POOP"),           # 💩
    ("\U0001f4af", "100"),            # 💯
    ("\U0001f4b0", "MONEY"),          # 💰
    ("\U0001f4b3", "CARD"),           # 💳
    ("\U0001f4bb", "PC"),             # 💻
    ("\U0001f4f1", "PHONE"),          # 📱
    ("\U0001f4f2", "CALL"),           # 📲
    ("\U0001f4f3", "VIBRATE"),        # 📳
    ("\U0001f4f4", "SILENT"),         # 📴
    ("\U0001f4f6", "SIGNAL"),         # 📶
    ("\U0001f4f7", "CAMERA"),         # 📷
    ("\U0001f4f8", "FLASH"),          # 📸
    ("\U0001f4f9", "VIDEO"),          # 📹
    ("\U0001f4fa", "TV"),             # 📺
    ("\U0001f4fb", "RADIO"),          # 📻
    ("\U0001f4fc", "VHS"),            # 📼
    ("\U0001f4fd\ufe0f", "FILM"),     # 📽️
    ("\U0001f4fe", "PROJECTOR"),      # 📾
    ("\U0001f4ff", "BEADS"),          # 📿
    ("\U0001f500", "SHUFFLE"),        # 🔀
    ("\U0001f501", "REPEAT"),         # 🔁
    ("\U0001f502", "REPEAT1"),        # 🔂
    ("\U0001f503", "CLOCKWISE"),      # 🔃
    ("\U0001f504", "ANTICLOCKWISE"),  # 🔄
    ("\U0001f505", "DIM"),            # 🔅
    ("\U0001f506", "BRIGHT"),         # 🔆
    ("\U0001f507", "MUTE"),           # 🔇
    ("\U0001f508", "SPEAKER"),        # 🔈
    ("\U0001f509", "SOUND"),          # 🔉
    ("\U0001f50a", "LOUD"),           # 🔊
    ("\U0001f50b", "BATTERY"),        # 🔋
    ("\U0001f50c", "PLUG"),           # 🔌
    ("\U0001f50e", "MAGNIFY"),        # 🔎
    ("\U0001f50f", "LOCKED"),         # 🔏
    ("\U0001f510", "UNLOCKED"),       # 🔐
    ("\U0001f511", "KEY"),            # 🔑
    ("\U0001f513", "OPEN"),           # 🔓
    ("\U0001f514", "BELL"),           # 🔔
    ("\U0001f515", "NO BELL"),        # 🔕
    ("\U0001f516", "BOOKMARK"),       # 🔖
    ("\U0001f517", "LINK"),           # 🔗
    ("\U0001f518", "RADIO BTN"),      # 🔘
    ("\U0001f519", "BACK"),           # 🔙
    ("\U0001f51a", "END"),            # 🔚
    ("\U0001f51b", "ON"),             # 🔛
    ("\U0001f51c", "SOON"),           # 🔜
    ("\U0001f51d", "TOP"),            # 🔝
    ("\U0001f51e", "18+"),            # 🔞
    ("\U0001f51f", "10"),             # 🔟
]

for old, new in fixes:
    html = html.replace(old, new)

# Also fix any remaining garbled sequences that look like mojibake
# Pattern: sequences of chars in range 0x80-0xFF that form mojibake
import re
# Replace any remaining non-ASCII that isn't a real intended char
# Keep only printable ASCII + newlines + tabs
def clean(m):
    return ""
html = re.sub(r'[\x80-\x9f]', '', html)

with open("index.html", "w", encoding="utf-8") as f:
    f.write(html)

print("Done")
