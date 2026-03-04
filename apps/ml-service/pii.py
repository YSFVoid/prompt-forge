import re

EMAIL_RE = re.compile(r'[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+')
PHONE_RE = re.compile(r'(\+?\d{1,3}[-.\s]?)?\(?\d{2,4}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}')
TOKEN_RE = re.compile(r'(sk-|gsk_|ghp_|glpat-|xoxb-)[a-zA-Z0-9_-]{20,}')
IP_RE = re.compile(r'\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b')


def redact_pii(text: str) -> str:
    text = EMAIL_RE.sub('[EMAIL]', text)
    text = TOKEN_RE.sub('[TOKEN]', text)
    text = PHONE_RE.sub('[PHONE]', text)
    text = IP_RE.sub('[IP]', text)
    return text
