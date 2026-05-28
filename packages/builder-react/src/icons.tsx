import type { SVGProps } from "react";

const base: SVGProps<SVGSVGElement> = {
  width: 16,
  height: 16,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round",
  strokeLinejoin: "round",
};

type IconProps = Omit<SVGProps<SVGSVGElement>, "children">;

export const IconText = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 6h16M8 6v12M16 6v12M6 18h4M14 18h4" />
  </svg>
);
export const IconTextarea = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="M7 9h10M7 13h6" />
  </svg>
);
export const IconMail = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
export const IconLock = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="11" width="16" height="9" rx="2" />
    <path d="M8 11V8a4 4 0 1 1 8 0v3" />
  </svg>
);
export const IconPhone = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4h4l2 5-3 2a11 11 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" />
  </svg>
);
export const IconLink = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M10 13a5 5 0 0 0 7 0l3-3a5 5 0 1 0-7-7l-1 1" />
    <path d="M14 11a5 5 0 0 0-7 0l-3 3a5 5 0 1 0 7 7l1-1" />
  </svg>
);
export const IconHash = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 9h16M4 15h16M10 4 8 20M16 4l-2 16" />
  </svg>
);
export const IconChevronDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="4" y="4" width="16" height="16" rx="3" />
    <path d="m8 12 3 3 5-6" />
  </svg>
);
export const IconRadio = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
);
export const IconCalendar = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconUpload = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 16V4M7 9l5-5 5 5" />
    <path d="M5 20h14" />
  </svg>
);
export const IconStar = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.8 1-6.1L3.2 9.4l6.1-.9L12 3z" />
  </svg>
);
export const IconSlider = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 12h16" />
    <circle cx="9" cy="12" r="3" fill="currentColor" />
  </svg>
);
export const IconEye = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M1 12s4-7 11-7 11 7 11 7-4 7-11 7S1 12 1 12z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);
export const IconCode = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 8-5 4 5 4M15 8l5 4-5 4" />
  </svg>
);
export const IconUndo = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
  </svg>
);
export const IconRedo = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m15 14 5-5-5-5" />
    <path d="M20 9H9a5 5 0 0 0 0 10h4" />
  </svg>
);
export const IconPlus = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const IconSave = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
    <path d="M17 21v-8H7v8M7 3v5h8" />
  </svg>
);
export const IconDownload = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4v12M7 11l5 5 5-5" />
    <path d="M5 20h14" />
  </svg>
);
export const IconClipboard = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="6" y="4" width="12" height="17" rx="2" />
    <path d="M9 4h6v3H9z" />
  </svg>
);
export const IconCloud = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 18a4 4 0 1 1 .9-7.9A6 6 0 1 1 17 17H7z" />
  </svg>
);
export const IconTrash = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13" />
  </svg>
);
export const IconCopy = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15V5a2 2 0 0 1 2-2h8" />
  </svg>
);
export const IconArrowUp = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 19V5M5 12l7-7 7 7" />
  </svg>
);
export const IconArrowDown = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12l7 7 7-7" />
  </svg>
);
export const IconGrip = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="9" cy="6" r="1.4" fill="currentColor" />
    <circle cx="15" cy="6" r="1.4" fill="currentColor" />
    <circle cx="9" cy="12" r="1.4" fill="currentColor" />
    <circle cx="15" cy="12" r="1.4" fill="currentColor" />
    <circle cx="9" cy="18" r="1.4" fill="currentColor" />
    <circle cx="15" cy="18" r="1.4" fill="currentColor" />
  </svg>
);
export const IconEyeOff = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 3l18 18" />
    <path d="M10.6 6.1A11 11 0 0 1 23 12s-2 3.5-5.6 5.6M6.7 6.7C3.7 8.5 1 12 1 12s4 7 11 7c1.7 0 3.3-.4 4.7-1.1" />
  </svg>
);

export const IconHeading = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M5 4v16M19 4v16M5 12h14" />
  </svg>
);
export const IconLabelTag = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
    <circle cx="7.5" cy="7.5" r="1.4" fill="currentColor" />
  </svg>
);
export const IconType = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M4 7V5h16v2M9 5v14M15 5v14M7 19h4M13 19h4" />
  </svg>
);
export const IconImage = (p: IconProps) => (
  <svg {...base} {...p}>
    <rect x="3" y="3" width="18" height="18" rx="2" />
    <circle cx="9" cy="9" r="1.7" fill="currentColor" />
    <path d="m21 16-5-5L5 21" />
  </svg>
);
export const IconParagraph = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M13 4H7a4 4 0 0 0 0 8h2v8M17 4v16M13 4v16" />
  </svg>
);
export const IconDivider = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M3 12h18" />
  </svg>
);
export const IconSpacer = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 3v18M6 6l6-3 6 3M6 18l6 3 6-3" />
  </svg>
);
export const IconChevronRight = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
);
