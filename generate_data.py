#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import os
import json

# Paths
company_dir = r"D:\ZT180\Documents\obsidian趣味导图\王兴饭否语录库\02_智库\实体\公司"
person_dir = r"D:\ZT180\Documents\obsidian趣味导图\王兴饭否语录库\02_智库\实体\人物"
output_dir = r"C:\Users\ZT180\wangxing-kb-web\data"

os.makedirs(output_dir, exist_ok=True)

companies = {}
people = {}

# Read all company files
print("Reading company files...")
for filename in os.listdir(company_dir):
    if filename.endswith('.md') and filename != 'INDEX.md':
        name = filename[:-3]  # Remove .md
        filepath = os.path.join(company_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            companies[name] = f.read()
        print(f"  Loaded: {name}")

# Read all person files
print("\nReading person files...")
for filename in os.listdir(person_dir):
    if filename.endswith('.md') and filename != 'INDEX.md':
        name = filename[:-3]  # Remove .md
        filepath = os.path.join(person_dir, filename)
        with open(filepath, 'r', encoding='utf-8') as f:
            people[name] = f.read()
        print(f"  Loaded: {name}")

# Extract metadata for indexing
def extract_meta(content, name):
    meta = {'name': name}
    lines = content.split('\n')

    # Parse YAML frontmatter if exists
    if lines[0] == '---':
        try:
            end_idx = lines[1:].index('---') + 1
            for line in lines[1:end_idx]:
                if ':' in line:
                    key, val = line.split(':', 1)
                    key = key.strip()
                    val = val.strip().strip('"')
                    meta[key] = val
        except:
            pass

    # Get first paragraph as summary
    for line in lines:
        if line.strip() and not line.startswith('#') and not line.startswith('---'):
            if len(line) > 20:
                meta['summary'] = line.strip()[:150]
                break

    return meta

# Build index
company_list = [extract_meta(v, k) for k, v in companies.items()]
person_list = [extract_meta(v, k) for k, v in people.items()]

# Save files
companies_path = os.path.join(output_dir, 'companies.json')
people_path = os.path.join(output_dir, 'people.json')
index_path = os.path.join(output_dir, 'index.json')

with open(companies_path, 'w', encoding='utf-8') as f:
    json.dump(companies, f, ensure_ascii=False, indent=1)

with open(people_path, 'w', encoding='utf-8') as f:
    json.dump(people, f, ensure_ascii=False, indent=1)

with open(index_path, 'w', encoding='utf-8') as f:
    json.dump({
        'companies': company_list,
        'people': person_list,
        'stats': {
            'total_companies': len(companies),
            'total_people': len(people),
            'total_entries': 14194
        }
    }, f, ensure_ascii=False, indent=2)

print(f"\nDone!")
print(f"  Companies: {len(companies)}")
print(f"  People: {len(people)}")
print(f"\nFiles saved to: {output_dir}")
