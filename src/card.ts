/**
 * OG image generation for shareable social stats cards.
 * Uses satori to generate SVG on Cloudflare Workers.
 * PNG conversion happens client-side via canvas for downloads.
 */
import satori from 'satori';
import { getTitle, formatTokens, formatCost } from './utils';

// Cache font in module scope
let fontData: ArrayBuffer | null = null;

async function getFont(): Promise<ArrayBuffer> {
  if (fontData) return fontData;
  const res = await fetch(
    'https://fonts.gstatic.com/s/inter/v18/UcCO3FwrK3iLTeHuS_nVMrMxCp50SjIw2boKoduKmMEVuLyfMZhrib2Bg-4.ttf'
  );
  fontData = await res.arrayBuffer();
  return fontData;
}

export interface CardData {
  displayName: string;
  avatarUrl: string | null;
  rank: number;
  totalCost: number;
  totalTokens: number;
  totalOutputTokens: number;
  daysActive: number;
  lastActive: string | null;
}

function getRankAccent(rank: number): { color: string; label: string } {
  if (rank === 1) return { color: '#eab308', label: '#1' };
  if (rank === 2) return { color: '#9ca3af', label: '#2' };
  if (rank === 3) return { color: '#b45309', label: '#3' };
  return { color: '#7c3aed', label: `#${rank}` };
}

export async function generateCardSvg(data: CardData, mode: 'simple' | 'full'): Promise<string> {
  const font = await getFont();
  const title = getTitle(data.totalCost);
  const rankInfo = getRankAccent(data.rank);

  const children: any[] = [
    // Top accent bar
    {
      type: 'div',
      props: {
        style: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 6,
          background: `linear-gradient(90deg, ${rankInfo.color}, #7c3aed)`,
        },
        children: [],
      },
    },
    // Header row: rank + name + title
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          marginBottom: 32,
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: 48,
                fontWeight: 700,
                color: rankInfo.color,
              },
              children: rankInfo.label,
            },
          },
          {
            type: 'div',
            props: {
              style: {
                display: 'flex',
                flexDirection: 'column',
              },
              children: [
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 36,
                      fontWeight: 700,
                      color: '#f3f4f6',
                    },
                    children: data.displayName.length > 20
                      ? data.displayName.slice(0, 18) + '...'
                      : data.displayName,
                  },
                },
                {
                  type: 'div',
                  props: {
                    style: {
                      fontSize: 20,
                      color: title.color,
                      fontWeight: 600,
                    },
                    children: title.label,
                  },
                },
              ],
            },
          },
        ],
      },
    },
    // Main stat: cost
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          alignItems: 'baseline',
          gap: 12,
          marginBottom: 24,
        },
        children: [
          {
            type: 'div',
            props: {
              style: {
                fontSize: 72,
                fontWeight: 700,
                color: '#c084fc',
              },
              children: formatCost(data.totalCost),
            },
          },
          {
            type: 'div',
            props: {
              style: {
                fontSize: 24,
                color: '#9ca3af',
              },
              children: 'total spent',
            },
          },
        ],
      },
    },
    // Stats row
    {
      type: 'div',
      props: {
        style: {
          display: 'flex',
          gap: 40,
          marginBottom: mode === 'full' ? 24 : 0,
        },
        children: [
          statBox('Tokens', formatTokens(data.totalTokens)),
          statBox('Output', formatTokens(data.totalOutputTokens)),
          statBox('Days Active', String(data.daysActive)),
        ],
      },
    },
  ];

  if (mode === 'full' && data.lastActive) {
    children.push({
      type: 'div',
      props: {
        style: { fontSize: 18, color: '#6b7280' },
        children: `Last active: ${data.lastActive}`,
      },
    });
  }

  // Footer branding
  children.push({
    type: 'div',
    props: {
      style: {
        position: 'absolute',
        bottom: 32,
        right: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      },
      children: [
        {
          type: 'div',
          props: {
            style: { fontSize: 20, color: '#6b7280' },
            children: 'ccrank.dev',
          },
        },
      ],
    },
  });

  const element = {
    type: 'div',
    props: {
      style: {
        width: 1200,
        height: 630,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        padding: '48px',
        background: 'linear-gradient(135deg, #111827 0%, #1e1b4b 50%, #111827 100%)',
        fontFamily: 'Inter',
        position: 'relative',
      },
      children,
    },
  };

  return satori(element as any, {
    width: 1200,
    height: 630,
    fonts: [
      {
        name: 'Inter',
        data: font,
        weight: 400,
        style: 'normal' as const,
      },
    ],
  });
}

function statBox(label: string, value: string) {
  return {
    type: 'div',
    props: {
      style: {
        display: 'flex',
        flexDirection: 'column',
      },
      children: [
        {
          type: 'div',
          props: {
            style: {
              fontSize: 32,
              fontWeight: 700,
              color: '#e5e7eb',
            },
            children: value,
          },
        },
        {
          type: 'div',
          props: {
            style: {
              fontSize: 16,
              color: '#9ca3af',
            },
            children: label,
          },
        },
      ],
    },
  };
}
