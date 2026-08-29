#!/usr/bin/env python3
"""
update_cache.py -- fetch GitHub data via GraphQL and write data/github-cache.json
Called by .github/workflows/update-github-data.yml
"""

import json
import os
import subprocess
from datetime import datetime, timezone

username = os.environ.get('GITHUB_USERNAME', 'night-slayer18')
org_name = os.environ.get('GITHUB_ORG', 'OpenSyntaxHQ')
token    = os.environ.get('GH_TOKEN', '')

if not token:
    raise SystemExit("ERROR: GH_TOKEN is not set. Add GH_PAT to your repository secrets.")

LANG_COLORS = {
    'TypeScript': '#3178c6', 'JavaScript': '#f1e05a',
    'Go':         '#00add8', 'Python':     '#3572A5',
    'Java':       '#b07219', 'Shell':      '#89e051',
    'Rust':       '#dea584', 'C':          '#555555',
    'C++':        '#f34b7d', 'Ruby':       '#701516',
    'HTML':       '#e34c26', 'CSS':        '#563d7c',
    'Vue':        '#41b883', 'Swift':      '#ffac45',
    'Kotlin':     '#7F52FF', 'PLpgSQL':    '#336791',
}


def graphql(query, variables=None):
    payload = json.dumps({'query': query, 'variables': variables or {}})
    cmd = [
        'curl', '-s', '-X', 'POST',
        '-H', 'Authorization: bearer ' + token,
        '-H', 'Content-Type: application/json',
        '-H', 'User-Agent: Portfolio-Cache-Updater',
        '-d', payload,
        'https://api.github.com/graphql'
    ]
    res = subprocess.run(cmd, capture_output=True, text=True)
    data = json.loads(res.stdout)
    if 'errors' in data:
        raise RuntimeError('GraphQL errors: ' + str(data['errors']))
    return data['data']


USER_QUERY = """
query($login: String!, $repoCount: Int!) {
  user(login: $login) {
    login
    name
    bio
    company
    location
    avatarUrl
    followers { totalCount }
    following  { totalCount }
    createdAt
    repositories(
      first: $repoCount
      ownerAffiliations: [OWNER]
      isFork: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      nodes {
        name
        nameWithOwner
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        isPrivate
        primaryLanguage { name }
        repositoryTopics(first: 10) { nodes { topic { name } } }
        updatedAt
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays {
            date
            contributionCount
          }
        }
      }
    }
  }
}
"""

ORG_QUERY = """
query($org: String!, $repoCount: Int!) {
  organization(login: $org) {
    repositories(
      first: $repoCount
      isArchived: false
      orderBy: { field: UPDATED_AT, direction: DESC }
    ) {
      nodes {
        name
        nameWithOwner
        description
        url
        homepageUrl
        stargazerCount
        forkCount
        isPrivate
        isFork
        primaryLanguage { name }
        repositoryTopics(first: 10) { nodes { topic { name } } }
        updatedAt
      }
    }
  }
}
"""


def parse_repo(r, source, is_opensyntax):
    topics = [t['topic']['name'] for t in r['repositoryTopics']['nodes']]
    return {
        'name':             r['name'],
        'full_name':        r['nameWithOwner'],
        'description':      r['description'] or '',
        'html_url':         r['url'],
        'homepage':         r['homepageUrl'] or '',
        'stargazers_count': r['stargazerCount'],
        'forks_count':      r['forkCount'],
        'language':         (r['primaryLanguage'] or {}).get('name', ''),
        'topics':           topics[:5],
        'updated_at':       r['updatedAt'],
        '_source':          source,
        'isOpenSyntax':     is_opensyntax,
    }


print('Fetching data for @' + username + '...')
user_data = graphql(USER_QUERY, {'login': username, 'repoCount': 100})
u = user_data['user']

profile = {
    'login':      u['login'],
    'name':       u['name'] or 'Samanuai A',
    'avatar_url': u['avatarUrl'],
    'bio':        u['bio'] or 'Founder @OpenSyntaxHQ',
    'company':    u.get('company') or 'Founder @OpenSyntaxHQ',
    'location':   u['location'] or 'Kochi, Kerala',
    'followers':  u['followers']['totalCount'],
    'following':  u['following']['totalCount'],
    'created_at': u['createdAt'],
}

personal_repos = [
    parse_repo(r, username, False)
    for r in u['repositories']['nodes']
    if not r.get('isPrivate')
]
print('  Personal repos: ' + str(len(personal_repos)))

cal = u['contributionsCollection']['contributionCalendar']
total_contributions = cal['totalContributions']

all_days = []
for week in cal['weeks']:
    for day in week['contributionDays']:
        all_days.append(day)

all_days.sort(key=lambda d: d['date'], reverse=True)
today = datetime.now(timezone.utc).strftime('%Y-%m-%d')

streak = 0
for day in all_days:
    if day['date'] > today:
        continue
    if day['contributionCount'] > 0:
        streak += 1
    elif day['date'] == today:
        continue
    else:
        break

contribution_streak = streak
print('  Streak: ' + str(contribution_streak) + 'd | Contributions: ' + str(total_contributions))

print('Fetching org repos for @' + org_name + '...')
org_repos = []
try:
    org_data = graphql(ORG_QUERY, {'org': org_name, 'repoCount': 100})
    org_repos = [
        parse_repo(r, org_name, True)
        for r in org_data['organization']['repositories']['nodes']
        if not r.get('isPrivate') and not r.get('isFork')
    ]
    print('  Org repos: ' + str(len(org_repos)))
except Exception as e:
    print('  Org repos skipped: ' + str(e))

seen = set()
all_repos = []
for r in personal_repos + org_repos:
    if r['name'] not in seen:
        seen.add(r['name'])
        all_repos.append(r)

profile['public_repos'] = len(all_repos)

lang_count  = {}
total_stars = 0
total_forks = 0
for r in all_repos:
    total_stars += r['stargazers_count']
    total_forks += r['forks_count']
    lang = r['language']
    if lang:
        lang_count[lang] = lang_count.get(lang, 0) + 1

top_languages = [
    {'name': lang, 'count': cnt, 'color': LANG_COLORS.get(lang, '#666')}
    for lang, cnt in sorted(lang_count.items(), key=lambda x: -x[1])[:6]
]

eligible = sorted(
    [r for r in all_repos if r['description'] and not r['name'].startswith('.')],
    key=lambda r: (-r['stargazers_count'], -len(r['topics']))
)

featured_repos = [
    {
        'name':             r['name'],
        'full_name':        r['full_name'],
        'org':              r['_source'],
        'description':      r['description'],
        'html_url':         r['html_url'],
        'homepage':         r['homepage'],
        'stargazers_count': r['stargazers_count'],
        'forks_count':      r['forks_count'],
        'language':         r['language'],
        'topics':           r['topics'],
        'updated_at':       r['updated_at'],
        'featured':         r['stargazers_count'] >= 5 or r['name'] == 'tweak',
        'isOpenSyntax':     r['isOpenSyntax'],
    }
    for r in eligible[:12]
]

cache = {
    'generated_at': datetime.now(timezone.utc).isoformat(),
    'profile':      profile,
    'stats': {
        'total_stars':         total_stars,
        'total_forks':         total_forks,
        'total_repos':         len(all_repos),
        'top_languages':       top_languages,
        'contribution_streak': contribution_streak,
        'total_contributions': total_contributions,
    },
    'featured_repos': featured_repos,
}

os.makedirs('data', exist_ok=True)
with open('data/github-cache.json', 'w') as f:
    json.dump(cache, f, indent=2)

print('\nDone: ' + str(len(all_repos)) + ' repos | ' + str(total_stars) + 'stars | streak=' + str(contribution_streak) + 'd | contributions=' + str(total_contributions))
