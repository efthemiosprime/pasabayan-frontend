import {
  ArrowDown, ArrowLeftRight, ArrowRight, BadgeCheck, Ban, Banknote, BatteryFull, BatteryWarning, Bell, BellRing,
  Box, Bus, Calendar, Car, CircleCheck, CircleX, Plus, CalendarCheck, CarFront, Check, ChevronDown, ChevronLeft, ChevronRight, CircleAlert,
  CircleCheckBig, CircleDollarSign, CircleSlash, CircleUserRound, ClockAlert, CreditCard, Ellipsis, FileText,
  Flame, FlaskConical, Gift, Globe, ImagePlus, Info, KeyRound, List, Lock, MapPin, MessageSquare, Navigation, Package,
  Pill, Plane, RotateCcw, Rows2, Search, Send, Shield, ShieldCheck, Shirt, ShoppingBasket, Smartphone,
  Sparkles, SprayCan, Star, TrainFront, Upload, User, Users, Utensils, Weight, Wifi, X,
} from 'lucide-react';

/* Explicit kebab-case map keeps the bundle tree-shaken to the icons the site uses. */
const ICONS = {
  'arrow-down': ArrowDown, 'arrow-left-right': ArrowLeftRight, 'arrow-right': ArrowRight, 'badge-check': BadgeCheck,
  ban: Ban, banknote: Banknote, 'battery-full': BatteryFull, 'battery-warning': BatteryWarning, bell: Bell,
  'bell-ring': BellRing, box: Box, bus: Bus, car: Car, 'circle-check': CircleCheck, 'circle-x': CircleX, plus: Plus, calendar: Calendar, 'calendar-check': CalendarCheck, 'car-front': CarFront,
  check: Check, 'chevron-down': ChevronDown, 'chevron-left': ChevronLeft, 'chevron-right': ChevronRight,
  'circle-alert': CircleAlert, 'circle-check-big': CircleCheckBig, 'circle-dollar-sign': CircleDollarSign,
  'circle-slash': CircleSlash, 'circle-user-round': CircleUserRound, 'clock-alert': ClockAlert, 'credit-card': CreditCard,
  ellipsis: Ellipsis, 'file-text': FileText, flame: Flame, 'flask-conical': FlaskConical, gift: Gift, globe: Globe,
  'image-plus': ImagePlus, info: Info, 'key-round': KeyRound, list: List, lock: Lock, 'map-pin': MapPin, 'message-square': MessageSquare,
  navigation: Navigation, package: Package, pill: Pill, plane: Plane, 'rotate-ccw': RotateCcw, 'rows-2': Rows2,
  search: Search, send: Send, shield: Shield, 'shield-check': ShieldCheck, shirt: Shirt,
  'shopping-basket': ShoppingBasket, smartphone: Smartphone, sparkles: Sparkles, 'spray-can': SprayCan, star: Star, 'train-front': TrainFront,
  upload: Upload, user: User, users: Users, utensils: Utensils, weight: Weight, wifi: Wifi, x: X,
};

/* `fill` paints the glyph body (for SF Symbol ".fill" looks); `stroke` then colors the inner marks. */
export function Icon({ name, size = 24, color = 'currentColor', fill = 'none', stroke, strokeWidth = 1.75, style }) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return (
    <Cmp
      aria-hidden="true"
      size={size}
      color={stroke ?? color}
      fill={fill}
      strokeWidth={strokeWidth}
      style={{ width: size, height: size, display: 'inline-flex', flex: 'none', ...style }}
    />
  );
}
