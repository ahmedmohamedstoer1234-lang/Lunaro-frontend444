import { createClient } from '@supabase/supabase-js';
import type { Project } from './projects';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      })
    : null;

type SiteSettings = {
  site_title?: string | null;
  custom_css_url?: string | null;
  social_links?: unknown;
};

type RemoteProject = {
  id?: string | number | null;
  title?: string | null;
  category?: string | null;
  description?: string | null;
  image_url?: string | null;
  live_url?: string | null;
};

function safeHttpUrl(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  try {
    const url = new URL(value.trim(), window.location.href);

    if (url.protocol === 'http:' || url.protocol === 'https:') {
      return url.href;
    }

    return null;
  } catch {
    return null;
  }
}

function safeProjectImage(value: unknown): string | null {
  if (typeof value !== 'string' || !value.trim()) {
    return null;
  }

  const raw = value.trim();

  if (raw.startsWith('/')) {
    return raw;
  }

  return safeHttpUrl(raw);
}

/* =========================
   Dynamic Custom CSS
========================= */

function applyCustomCss(value: unknown): void {
  const existing = document.getElementById('lunaro-dynamic-css');
  const href = safeHttpUrl(value);

  if (!href) {
    existing?.remove();
    return;
  }

  const link =
    existing instanceof HTMLLinkElement
      ? existing
      : document.createElement('link');

  link.id = 'lunaro-dynamic-css';
  link.rel = 'stylesheet';
  link.href = href;

  if (!link.isConnected) {
    document.head.appendChild(link);
  }
}

/* =========================
   Dynamic Social Links
========================= */

function normalizeSocialLinks(
  value: unknown
): Array<{ label: string; url: string; icon?: string }> {
  const entries = Array.isArray(value)
    ? value
    : value && typeof value === 'object'
      ? Object.entries(value as Record<string, unknown>).map(
          ([platform, item]) => {
            if (typeof item === 'string') {
              return {
                platform,
                url: item
              };
            }

            if (item && typeof item === 'object') {
              return {
                platform,
                ...(item as Record<string, unknown>)
              };
            }

            return null;
          }
        )
      : [];

  return entries.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const item = entry as Record<string, unknown>;
    const url = safeHttpUrl(item.url ?? item.href);

    if (!url) {
      return [];
    }

    const labelValue =
      item.label ?? item.platform ?? item.name ?? item.icon;

    const label =
      typeof labelValue === 'string' && labelValue.trim()
        ? labelValue.trim()
        : 'Social';

    const icon =
      typeof item.icon === 'string' && item.icon.trim()
        ? item.icon.trim()
        : undefined;

    return [{ label, url, icon }];
  });
}

function applySocialLinks(value: unknown): void {
  document
    .querySelectorAll<HTMLElement>('[data-dynamic-links]')
    .forEach((container) => {
      container.replaceChildren();

      normalizeSocialLinks(value).forEach(({ label, url, icon }) => {
        const anchor = document.createElement('a');

        anchor.href = url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.className = 'dynamic-social-link';
        anchor.setAttribute('aria-label', label);

        if (icon) {
          anchor.textContent = icon;
        } else {
          anchor.textContent = label;
        }

        container.appendChild(anchor);
      });

      container.hidden = container.childElementCount === 0;
    });
}

/* =========================
   Site Settings
========================= */

function applySiteSettings(settings: SiteSettings | null): void {
  if (!settings) {
    return;
  }

  if (
    typeof settings.site_title === 'string' &&
    settings.site_title.trim()
  ) {
    document.title = settings.site_title.trim();
  }

  applyCustomCss(settings.custom_css_url);
  applySocialLinks(settings.social_links);
}

async function refreshSiteSettings(): Promise<void> {
  if (!supabase) {
    return;
  }

  const { data, error } = await supabase
    .from('site_settings')
    .select('site_title, custom_css_url, social_links')
    .limit(1)
    .maybeSingle();

  if (error) {
    console.warn(
      '[Lunaro] Could not load site settings:',
      error.message
    );

    return;
  }

  applySiteSettings(data as SiteSettings | null);
}

/* =========================
   Realtime: Site Settings
========================= */

if (supabase) {
  void refreshSiteSettings();

  supabase
    .channel('lunaro-site-settings')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'site_settings'
      },
      () => {
        void refreshSiteSettings();
      }
    )
    .subscribe();
}

/* =========================
   Remote Projects
========================= */

export async function fetchRemoteProjects(): Promise<Project[]> {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase
    .from('projects')
    .select('id, title, category, description, image_url, live_url');

  if (error) {
    console.warn(
      '[Lunaro] Could not load remote projects:',
      error.message
    );

    return [];
  }

  return ((data ?? []) as RemoteProject[]).flatMap(
    (item, index) => {
      const name =
        typeof item.title === 'string'
          ? item.title.trim()
          : '';

      const image = safeProjectImage(item.image_url);

      if (
        !name ||
        !item.category ||
        !item.description ||
        !image
      ) {
        return [];
      }

      const id =
        item.id == null
          ? `supabase-project-${index}-${name}`
          : `supabase-project-${item.id}`;

      return [
        {
          id,
          name,
          category: item.category,
          description: item.description,
          image,
          alt: `صورة مشروع ${name}`,
          demo: false
        }
      ];
    }
  );
}

/* =========================
   Realtime: Projects
========================= */

export function subscribeToRemoteProjects(
  onChange: () => void
): () => void {
  if (!supabase) {
    return () => undefined;
  }

  const channel = supabase
    .channel('lunaro-public-projects')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'projects'
      },
      onChange
    )
    .subscribe();

  return () => {
    void supabase.removeChannel(channel);
  };
}
