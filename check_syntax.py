import re

html = open('index.html', encoding='utf-8').read()
m = re.search(r'<script type="text/babel">(.*?)</script>', html, re.DOTALL)
if m:
    code = m.group(1)
    print("JSX Code length:", len(code))
    for open_b, close_b in [('{', '}'), ('(', ')'), ('[', ']')]:
        o = code.count(open_b)
        c = code.count(close_b)
        print(f"{open_b} {close_b}: {o} vs {c}")
else:
    print("No babel script found!")
