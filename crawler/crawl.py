#!/usr/bin/env python3
"""
Simple crawler to index pages into the server MeiliSearch endpoint.
Usage: python3 crawl.py seeds.txt
"""
import sys
import requests
from bs4 import BeautifulSoup
from urllib.parse import urlparse


def extract_text(html):
    soup = BeautifulSoup(html, 'lxml')
    # remove scripts/styles
    for s in soup(['script', 'style', 'noscript']):
        s.decompose()
    title = soup.title.string.strip() if soup.title and soup.title.string else ''
    # get visible text
    texts = soup.stripped_strings
    content = ' '.join(texts)
    return title, content[:50000]


def index_url(server_url, url):
    try:
        r = requests.get(url, timeout=10)
        r.raise_for_status()
    except Exception as e:
        print(f'Failed to fetch {url}: {e}')
        return False

    title, content = extract_text(r.text)
    doc = {
        'id': url,
        'url': url,
        'title': title or url,
        'content': content
    }

    try:
        res = requests.post(f'{server_url}/api/index/add', json={'documents': [doc]}, timeout=10)
        res.raise_for_status()
        print(f'Indexed {url}')
        return True
    except Exception as e:
        print(f'Indexing failed for {url}: {e}')
        return False


def main():
    if len(sys.argv) < 2:
        print('Usage: crawl.py seeds.txt [server_url]')
        sys.exit(1)

    seeds_file = sys.argv[1]
    server_url = sys.argv[2] if len(sys.argv) > 2 else 'http://localhost:3000'

    with open(seeds_file, 'r') as f:
        urls = [line.strip() for line in f if line.strip()]

    for url in urls:
        index_url(server_url, url)


if __name__ == '__main__':
    main()
