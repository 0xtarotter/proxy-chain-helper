---
version: alpha
name: Proxy Chain Helper
license: proprietary
description: A compact, high-signal network inspector for Mihomo and OpenClash.
colors:
  primary: "#4F46E5"
  primary-strong: "#3730A3"
  secondary: "#7C3AED"
  background: "#F4F7FB"
  surface: "#FFFFFF"
  surface-soft: "#EEF2FF"
  text: "#172033"
  text-muted: "#5F6C80"
  outline: "#D9E0EC"
  success: "#087A55"
  warning: "#A15C00"
  danger: "#C43245"
typography:
  heading:
    fontFamily: system-ui
    fontSize: 1.0625rem
    fontWeight: 750
    lineHeight: 1.25
  body:
    fontFamily: system-ui
    fontSize: 0.875rem
    fontWeight: 450
    lineHeight: 1.5
  label:
    fontFamily: system-ui
    fontSize: 0.6875rem
    fontWeight: 700
    lineHeight: 1.3
  mono:
    fontFamily: ui-monospace
    fontSize: 0.6875rem
    fontWeight: 450
    lineHeight: 1.45
rounded:
  sm: 8px
  md: 12px
  lg: 18px
  pill: 999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  lg: 18px
  xl: 24px
components:
  app-shell:
    backgroundColor: "{colors.background}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 18px
  panel:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.lg}"
    padding: 14px
  panel-soft:
    backgroundColor: "{colors.surface-soft}"
    textColor: "{colors.text-muted}"
    rounded: "{rounded.md}"
    padding: 10px
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  button-primary-hover:
    backgroundColor: "{colors.primary-strong}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: 12px
  badge-secondary:
    backgroundColor: "{colors.secondary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.pill}"
    padding: 8px
  field-outline:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text}"
    rounded: "{rounded.md}"
    padding: 12px
  status-success:
    backgroundColor: "#ECFDF3"
    textColor: "{colors.success}"
    rounded: "{rounded.md}"
    padding: 10px
  status-warning:
    backgroundColor: "#FFF8E7"
    textColor: "{colors.warning}"
    rounded: "{rounded.md}"
    padding: 10px
  status-danger:
    backgroundColor: "#FFF1F3"
    textColor: "{colors.danger}"
    rounded: "{rounded.md}"
    padding: 10px
---

## Overview

Proxy Chain Helper is a compact developer utility, not a marketing page. The interface prioritizes current route, actual node, rule, latency, and errors. It should feel precise, quiet, and trustworthy during repeated use.

## Colors

Indigo is reserved for interactive controls and proxy state. Green, amber, and red communicate measured state, never decoration. Light and dark themes must preserve WCAG AA contrast. Frosted surfaces may be used only where a solid fallback remains readable.

## Typography

Use the operating system UI font for fast startup and native rendering. Technical values such as IP addresses and timestamps use the monospace token. Labels are small but never below 11px.

## Layout

The popup is a fixed 400px utility panel with an 8/12/18px spacing rhythm. Keep the current domain and scan action above results. Results use a two-column definition list optimized for scanning.

The options page uses a centered 760px column and collapses to one column below 620px. The webpage overlay remains compact and uses text-only status indicators.

## Elevation & Depth

Use one subtle shadow level for popup cards. Avoid stacking multiple translucent layers because the extension is rendered over arbitrary webpages and on low-power devices.

## Shapes

Use 8px radii for compact indicators, 12px for controls, 18px for information panels, and pill shapes only for short status badges.

## Components

Buttons expose visible focus, disabled, loading, hover, and active states. Status regions use `role=status` and polite announcements. Country codes are text badges rather than remote flag images, keeping the interface stable offline.

Transitions are limited to 200ms and only clarify hover, focus, and collapse states. Honor `prefers-reduced-motion` by removing nonessential animation and transition duration.

## Do's and Don'ts

- Do keep controller diagnostics distinct from public DNS/GeoIP diagnostics.
- Do render untrusted API values with `textContent` or escaped text.
- Do show unknown values explicitly as `—` or `未知`.
- Do expose a visible focus ring for every interactive target.
- Don't hide form controls with `display: none`.
- Don't fetch remote images for flags.
- Don't use decorative gradients behind dense result tables.
- Don't add animation that delays access to connection data.
