const template = document.createElement('template');

{
  const style = document.createElement('style');
  style.textContent = `
    usgs-quake-feed { display: block; max-inline-size: 42rem; margin: var(--space-3) auto; }
    .quake-feed { display: grid; gap: 0.75rem; padding: 1rem; border: var(--border); border-radius: 0.85rem; background: var(--paper); }
    .quake-feed__title, .quake-feed__status, .quake-feed__meta, .quake-feed__source { margin: 0; }
    .quake-feed__title { font-size: 1.3rem; line-height: 1.1; }
    .quake-feed__status { min-block-size: 2.5rem; padding: 0.75rem; border-radius: 0.65rem; background: var(--panel); }
    .quake-feed__list { display: grid; gap: 0.5rem; margin: 0; padding: 0; list-style: none; }
    .quake-feed__item { display: grid; gap: 0.1rem; padding: 0.7rem 0.8rem; border-left: 0.25rem solid var(--accent); border-radius: 0.45rem; background: var(--panel); }
    .quake-feed__item strong { font-size: 0.98rem; }
    .quake-feed__item time, .quake-feed__item span, .quake-feed__meta, .quake-feed__source { color: var(--muted); font-size: var(--text-s); }
    .quake-feed button { width: fit-content; border: 0; border-radius: 999px; padding: 0.65rem 0.9rem; background: var(--accent); color: var(--paper); font: inherit; font-weight: 700; cursor: pointer; }
    .quake-feed button[hidden] { display: none; }
    .quake-feed[data-state='idle'] .quake-feed__list, .quake-feed[data-state='empty'] .quake-feed__list { display: none; }
    .quake-feed[data-state='error'] { border-color: var(--accent); }
  `;

  const card = document.createElement('article');
  card.className = 'quake-feed';
  card.dataset.state = 'idle';
  card.setAttribute('aria-busy', 'false');

  const title = document.createElement('h2');
  title.className = 'quake-feed__title';
  title.dataset.title = '';
  title.textContent = 'USGS recent quakes';

  const status = document.createElement('p');
  status.className = 'quake-feed__status';
  status.dataset.status = '';
  status.textContent = 'Idle.';

  const list = document.createElement('ul');
  list.className = 'quake-feed__list';
  list.dataset.list = '';

  const retry = document.createElement('button');
  retry.type = 'button';
  retry.dataset.retry = '';
  retry.hidden = true;
  retry.textContent = 'Retry';

  const meta = document.createElement('p');
  meta.className = 'quake-feed__meta';
  meta.dataset.meta = '';

  const source = document.createElement('p');
  source.className = 'quake-feed__source';
  source.textContent = 'Source: ';

  const sourceLink = document.createElement('a');
  sourceLink.href = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/geojson.php';
  sourceLink.rel = 'noopener noreferrer';
  sourceLink.target = '_blank';
  sourceLink.textContent = 'USGS Earthquake Hazards Program';

  source.append(sourceLink);
  card.append(title, status, list, retry, meta, source);
  template.content.append(style, card);
}

const FEEDS = {
  all_hour: 'past hour',
  all_day: 'past day',
  all_week: 'past week',
  all_month: 'past month',
};

const CACHE_KEY = 'usgs-quake-feed-cache';
const CACHE_TTL = 10 * 60 * 1000;
const TIMEOUT_MS = 10 * 1000;

class UsgsQuakeFeed extends HTMLElement {
  static observedAttributes = ['feed', 'limit'];

  constructor() {
    super();
    this._ready = false;
    this._abort = null;
    this._timer = 0;
    this._retry = () => this.load();
  }

  connectedCallback() {
    if (!this._ready) {
      this.replaceChildren(template.content.cloneNode(true));
      this._els = {
        root: this.querySelector('.quake-feed'),
        title: this.querySelector('[data-title]'),
        status: this.querySelector('[data-status]'),
        list: this.querySelector('[data-list]'),
        retry: this.querySelector('[data-retry]'),
        meta: this.querySelector('[data-meta]'),
      };
      this._els.retry.addEventListener('click', this._retry);
      this._ready = true;
    }

    this.load();
  }

  disconnectedCallback() {
    this._abort?.abort();
    clearTimeout(this._timer);
    this._els?.retry.removeEventListener('click', this._retry);
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (this._ready && oldValue !== newValue && (name === 'feed' || name === 'limit')) {
      this.load();
    }
  }

  get feed() {
    const value = (this.getAttribute('feed') || 'all_day').toLowerCase();
    return FEEDS[value] ? value : 'all_day';
  }

  get limit() {
    const value = Number.parseInt(this.getAttribute('limit') || '3', 10);
    return Number.isFinite(value) && value > 0 ? Math.min(value, 10) : 3;
  }

  get endpoint() {
    return `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${this.feed}.geojson`;
  }

  setState(state, message, showRetry = false) {
    this._els.root.dataset.state = state;
    this._els.root.setAttribute('aria-busy', String(state === 'loading'));
    this._els.status.textContent = message;
    this._els.retry.hidden = !showRetry;
  }

  readCache() {
    try {
      const raw = localStorage.getItem(`${CACHE_KEY}:${this.feed}`);
      if (!raw) return null;
      const cached = JSON.parse(raw);
      return cached.expires > Date.now() ? cached.data : null;
    } catch {
      return null;
    }
  }

  writeCache(data) {
    try {
      localStorage.setItem(`${CACHE_KEY}:${this.feed}`, JSON.stringify({ expires: Date.now() + CACHE_TTL, data }));
    } catch {
      // Ignore storage failures.
    }
  }

  async load() {
    if (!this._ready) return;

    const cached = this.readCache();
    if (cached) {
      this.render(cached);
      return;
    }

    this._abort?.abort();
    this._abort = new AbortController();
    clearTimeout(this._timer);
    this._timer = setTimeout(() => this._abort?.abort(), TIMEOUT_MS);

    this.setState('loading', `Loading quakes from the ${FEEDS[this.feed]}.`);

    try {
      const response = await fetch(this.endpoint, {
        signal: this._abort.signal,
        headers: { Accept: 'application/json' },
      });

      if (!response.ok) throw new Error('Request failed');

      const data = await response.json();
      this.writeCache(data);
      this.render(data);
    } catch (error) {
      this.setState('error', error?.name === 'AbortError' ? 'Request timed out.' : 'Could not load quakes.', true);
      this._els.meta.textContent = 'Try again.';
    } finally {
      clearTimeout(this._timer);
      this._abort = null;
    }
  }

  render(data) {
    const items = (data?.features || []).slice(0, this.limit);
    this._els.list.replaceChildren();
    this._els.title.textContent = `Recent quakes (${FEEDS[this.feed]})`;
    this._els.meta.textContent = `Showing ${items.length} of ${(data?.features || []).length}.`;

    if (!items.length) {
      this.setState('empty', `No earthquakes for the ${FEEDS[this.feed]}.`);
      return;
    }

    const format = new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeStyle: 'short' });

    for (const feature of items) {
      const li = document.createElement('li');
      li.className = 'quake-feed__item';

      const strong = document.createElement('strong');
      strong.textContent = `M ${Number(feature?.properties?.mag || 0).toFixed(1)} — ${feature?.properties?.place || 'Unknown location'}`;

      const time = document.createElement('time');
      const when = new Date(Number(feature?.properties?.time || Date.now()));
      time.dateTime = when.toISOString();
      time.textContent = format.format(when);

      const depth = document.createElement('span');
      depth.textContent = `Depth: ${Array.isArray(feature?.geometry?.coordinates) && feature.geometry.coordinates.length > 2 ? feature.geometry.coordinates[2] : '?'} km`;

      li.append(strong, time, depth);
      this._els.list.append(li);
    }

    this.setState('ready', `Loaded ${items.length} quakes from the ${FEEDS[this.feed]}.`);
  }
}

customElements.define('usgs-quake-feed', UsgsQuakeFeed);