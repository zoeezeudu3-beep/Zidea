c = open('index.html', encoding='utf-8').read()
s = c.find('  // Map rooms')
e = c.find('  // \u2500\u2500 Chat \u2500\u2500')
if e == -1:
    e = c.find('  // Chat')
print('start:', s, 'end:', e)
print('snippet_end:', repr(c[e:e+30]))
