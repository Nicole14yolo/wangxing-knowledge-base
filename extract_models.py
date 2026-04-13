#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os, json, re

model_dir = r"D:\ZT180\Documents\obsidian趣味导图\王兴饭否语录库\02_智库\思维模型"
output = {}

for fname in os.listdir(model_dir):
    if fname.endswith('.md') and fname != 'README.md':
        name = fname[:-3]
        with open(os.path.join(model_dir, fname), 'r', encoding='utf-8') as f:
            content = f.read()

        m = re.search(r'entry_count:\s*(\d+)', content)
        count = int(m.group(1)) if m else 0

        m = re.search(r'>\s*\*\*定义\*\*：(.+)', content)
        defn = m.group(1).strip() if m else ''

        m = re.search(r'\*\*王兴视角\*\*：(.+)', content)
        perspective = m.group(1).strip() if m else ''

        m = re.search(r'\*\*时间分布\*\*：(.+)', content)
        time_dist = m.group(1).strip() if m else ''

        # Extract quote blocks: text between "> " lines and "— date" lines
        quote_blocks = re.findall(r'> (.+?)\n> \n> —', content, re.DOTALL)
        clean_quotes = []
        for q in quote_blocks:
            q = re.sub(r'\n> ', ' ', q).strip()
            if len(q) > 15:
                clean_quotes.append(q)

        output[name] = {
            'name': name,
            'entry_count': count,
            'definition': defn,
            'perspective': perspective,
            'time_dist': time_dist,
            'quotes': clean_quotes[:6]
        }

out_path = r"C:\Users\ZT180\wangxing-kb-web\data\models.json"
with open(out_path, 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"Done! {len(output)} models saved to {out_path}")
for k, v in sorted(output.items(), key=lambda x: -x[1]['entry_count']):
    print(f"  {k}: {v['entry_count']} 条, {len(v['quotes'])} 语录")
