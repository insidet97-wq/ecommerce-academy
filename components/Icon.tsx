/**
 * Icon — single wrapper around lucide-react.
 *
 * Use semantic names (e.g. "target", "trophy") rather than importing lucide
 * components directly at every call site. Two reasons:
 *   1. Consistent default size + stroke-width across the app
 *   2. If we ever swap icon libraries, only this file changes
 *
 * To add a new icon:
 *   1. Add the name to IconName below
 *   2. Add the mapping to ICON_MAP
 *   3. (Optional) update CLAUDE.md's icon catalogue
 */

import {
  // Course / module concepts
  Target, Trophy, Brain, ShoppingCart, Zap, Smartphone, Megaphone,
  TrendingUp, Mail, Rocket, Microscope, BarChart3, Coins, Gift,
  Anchor, Film, FlaskConical, Scale, ScanSearch,
  // Tools / business
  DollarSign, Calculator, ListChecks, Factory, PenLine, ClipboardList,
  Eye, Search, Sparkles, BookOpen, Globe, Truck, Package, Music2,
  Camera, ShoppingBag, Palette, Star, Wallet, LineChart,
  // UI status
  Check, CheckCircle2, X, XCircle, AlertTriangle, AlertCircle, Lock,
  LockOpen, Loader2, ArrowRight, ArrowLeft, ArrowUpRight, ChevronRight,
  Plus, Minus, Trash2, Copy, ExternalLink, Settings, LogOut, Menu,
  Flame, Award, BadgeCheck, Crown, MessageSquare, Send, FileText,
  TestTube, Compass, Lightbulb, Edit3, Bot, Shield, RefreshCw,
  Users, User, Layers, BarChart, Tag, Hash, Cookie,
} from "lucide-react";

export type IconName =
  // Course / module concepts
  | "target"        // generic precision / niche
  | "trophy"        // winner / completion
  | "brain"         // learning / customer mind
  | "cart"          // store
  | "zap"           // fast / power / lightning
  | "smartphone"    // mobile / tiktok organic
  | "megaphone"     // ads
  | "trending-up"   // growth / conversion
  | "mail"          // email
  | "rocket"        // launch / scale
  | "microscope"    // analysis / diagnose
  | "bar-chart"     // metrics / data
  | "coins"         // money / revenue / AOV
  | "gift"          // offer / bundle
  | "anchor"        // hook (closest semantic)
  | "film"          // video / UGC
  | "flask"         // testing / lab
  | "scale"         // decision / weighing
  | "scan-search"   // forensic look (store autopsy)
  // Tools
  | "dollar"        // profit calc
  | "calculator"
  | "list-checks"   // launch checklist
  | "factory"       // supplier
  | "pen"           // copywriter
  | "clipboard"     // brief
  | "eye"           // audit
  | "search"
  | "sparkles"      // magic / AI / pro
  | "book-open"
  | "globe"
  | "truck"
  | "package"
  | "music"
  | "camera"
  | "shopping-bag"
  | "palette"
  | "star"
  | "wallet"
  | "line-chart"
  // UI status
  | "check" | "check-circle" | "x" | "x-circle"
  | "alert-triangle" | "alert-circle"
  | "lock" | "lock-open"
  | "loader" | "refresh"
  | "arrow-right" | "arrow-left" | "arrow-up-right" | "chevron-right"
  | "plus" | "minus" | "trash" | "copy" | "external-link"
  | "settings" | "log-out" | "menu"
  | "flame" | "award" | "badge-check" | "crown"
  | "message" | "send" | "file-text" | "test-tube"
  | "compass" | "lightbulb" | "edit" | "bot" | "shield"
  | "users" | "user" | "layers" | "tag" | "hash" | "cookie";

const ICON_MAP: Record<IconName, React.ComponentType<LucideProps>> = {
  // Course / module concepts
  "target":       Target,
  "trophy":       Trophy,
  "brain":        Brain,
  "cart":         ShoppingCart,
  "zap":          Zap,
  "smartphone":   Smartphone,
  "megaphone":    Megaphone,
  "trending-up":  TrendingUp,
  "mail":         Mail,
  "rocket":       Rocket,
  "microscope":   Microscope,
  "bar-chart":    BarChart3,
  "coins":        Coins,
  "gift":         Gift,
  "anchor":       Anchor,
  "film":         Film,
  "flask":        FlaskConical,
  "scale":        Scale,
  "scan-search":  ScanSearch,
  // Tools
  "dollar":       DollarSign,
  "calculator":   Calculator,
  "list-checks":  ListChecks,
  "factory":      Factory,
  "pen":          PenLine,
  "clipboard":    ClipboardList,
  "eye":          Eye,
  "search":       Search,
  "sparkles":     Sparkles,
  "book-open":    BookOpen,
  "globe":        Globe,
  "truck":        Truck,
  "package":      Package,
  "music":        Music2,
  "camera":       Camera,
  "shopping-bag": ShoppingBag,
  "palette":      Palette,
  "star":         Star,
  "wallet":       Wallet,
  "line-chart":   LineChart,
  // UI status
  "check":          Check,
  "check-circle":   CheckCircle2,
  "x":              X,
  "x-circle":       XCircle,
  "alert-triangle": AlertTriangle,
  "alert-circle":   AlertCircle,
  "lock":           Lock,
  "lock-open":      LockOpen,
  "loader":         Loader2,
  "refresh":        RefreshCw,
  "arrow-right":    ArrowRight,
  "arrow-left":     ArrowLeft,
  "arrow-up-right": ArrowUpRight,
  "chevron-right":  ChevronRight,
  "plus":           Plus,
  "minus":          Minus,
  "trash":          Trash2,
  "copy":           Copy,
  "external-link":  ExternalLink,
  "settings":       Settings,
  "log-out":        LogOut,
  "menu":           Menu,
  "flame":          Flame,
  "award":          Award,
  "badge-check":    BadgeCheck,
  "crown":          Crown,
  "message":        MessageSquare,
  "send":           Send,
  "file-text":      FileText,
  "test-tube":      TestTube,
  "compass":        Compass,
  "lightbulb":      Lightbulb,
  "edit":           Edit3,
  "bot":            Bot,
  "shield":         Shield,
  "users":          Users,
  "user":           User,
  "layers":         Layers,
  "tag":            Tag,
  "hash":           Hash,
  "cookie":         Cookie,
};

type LucideProps = {
  size?:        number | string;
  strokeWidth?: number;
  color?:       string;
  className?:   string;
  style?:       React.CSSProperties;
  "aria-hidden"?: boolean | "true" | "false";
};

export type IconProps = LucideProps & {
  name: IconName;
};

/**
 * <Icon name="target" size={20} /> — render a Lucide icon by semantic name.
 * Defaults: size=20, strokeWidth=2 (Lucide's defaults but explicit here so
 * future tweaks affect every call site at once).
 */
export function Icon({ name, size = 20, strokeWidth = 2, ...rest }: IconProps) {
  const Component = ICON_MAP[name];
  if (!Component) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`<Icon> unknown name: "${name}"`);
    }
    return null;
  }
  return <Component size={size} strokeWidth={strokeWidth} aria-hidden="true" {...rest} />;
}
