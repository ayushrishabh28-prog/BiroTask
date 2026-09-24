'use client';

import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Bot, Check, ExternalLink, Layers } from 'lucide-react';
import { templates } from '@/lib/templates';
import type { Business } from '@/lib/bots';

export function DemoGallery() {
  const [loadingSlug, setLoadingSlug] = useState('');
  const [error, setError] = useState('');
  const [demoBusinesses, setDemoBusinesses] = useState<Record<string, string>>({});

  useEffect(() => {
    fetch('/api/businesses').then(async (response) => {
      if (!response.ok) return;
      const result = await response.json() as { businesses?: Business[] };
      const matches: Record<string, string> = {};
      for (const business of result.businesses || []) {
        const slug = business.data.templateSlug || templates.find((template) =>
          business.data.sources.some((source) => source.id === `${template.slug}-website`)
        )?.slug;
        if (slug) matches[slug] = business.id;
      }
      setDemoBusinesses(matches);
    }).catch(() => undefined);
  }, []);

  async function addDemo(slug: string) {
    const existingId = demoBusinesses[slug];
    if (existingId) {
      window.location.assign(`/?business=${encodeURIComponent(existingId)}`);
      return;
    }
    setLoadingSlug(slug);
    setError('');
    try {
      const response = await fetch('/api/businesses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'template', slug }),
      });
      const result = await response.json() as { id?: string; error?: string };
      if (!response.ok || !result.id) throw new Error(result.error || 'Could not add this demo.');
      window.location.assign(`/?business=${encodeURIComponent(result.id)}`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not add this demo.');
      setLoadingSlug('');
    }
  }

  return (
    <main className="demo-gallery-page">
      <nav className="gallery-nav">
        <a className="gallery-brand" href="/"><span><Layers size={20} /></span>BotFoundry</a>
        <a className="gallery-back" href="/"><ArrowLeft size={15} /> Back to studio</a>
      </nav>

      <header className="gallery-heading">
        <span className="gallery-kicker">DEMO GALLERY · 03 BUSINESSES</span>
        <h1>See the whole journey.</h1>
        <p>Open a fictional business website and try its customer chatbot. Then add the same bot to your workspace to inspect its knowledge, edit its rules, and train it yourself.</p>
        <div className="gallery-flow" aria-label="Demo workflow">
          <span><b>1</b> Choose a business</span>
          <ArrowRight size={15} />
          <span><b>2</b> Try its website chatbot</span>
          <ArrowRight size={15} />
          <span><b>3</b> Add, edit, and train</span>
        </div>
      </header>

      {error && <div className="gallery-error" role="alert">{error}</div>}

      <section className="gallery-grid" aria-label="Demo businesses">
        {templates.map((template) => (
          <article
            className="gallery-card"
            key={template.slug}
            style={{ '--demo': template.color, '--demo-accent': template.accent } as React.CSSProperties}
          >
            <div className="gallery-browser">
              <div className="gallery-browser-bar"><i /><i /><i /><span>{template.slug}.example</span></div>
              <div className="gallery-site-preview">
                <small>{template.category}</small>
                <strong>{template.name}</strong>
                <p>{template.tagline}</p>
                <span className="gallery-preview-button">Explore</span>
                <span className="gallery-preview-chat"><Bot size={15} /></span>
              </div>
            </div>
            <div className="gallery-card-copy">
              <div className="gallery-card-title"><span>{template.icon}</span><div><h2>{template.name}</h2><small>{template.category} · Fictional demo</small></div></div>
              <p>{template.description}</p>
              <ul>
                <li><Check size={14} /> Complete example website</li>
                <li><Check size={14} /> Customer-facing chatbot</li>
                <li><Check size={14} /> Knowledge and {template.rules.length} reply rules</li>
              </ul>
              <div className="gallery-actions">
                <a href={`/templates/${template.slug}${demoBusinesses[template.slug] ? `?business=${encodeURIComponent(demoBusinesses[template.slug])}` : ''}`}>Open website <ExternalLink size={14} /></a>
                <button disabled={Boolean(loadingSlug)} onClick={() => addDemo(template.slug)}>
                  {loadingSlug === template.slug ? 'Adding…' : demoBusinesses[template.slug] ? 'Train in workspace' : 'Add bot to workspace'} <ArrowRight size={14} />
                </button>
              </div>
            </div>
          </article>
        ))}
      </section>

      <footer className="gallery-footer">
        <p>Every demo is editable. Change the knowledge, add alternative phrases, and train the bot again.</p>
        <a href="/">Go to my workspace <ArrowRight size={15} /></a>
      </footer>
    </main>
  );
}
