import { memo, useState, useMemo } from 'react';
import {
  Folder,
  Code,
  Video,
  Music,
  Image,
  FileText,
  BookOpen,
  Briefcase,
  ShoppingCart,
  Heart,
  Star,
  Bookmark,
  Tag,
  Globe,
  Newspaper,
  GraduationCap,
  Lightbulb,
  Wrench,
  Gamepad2,
  Film,
  Camera,
  Mic,
  Headphones,
  Tv,
  Monitor,
  Smartphone,
  Laptop,
  Database,
  Cloud,
  Lock,
  Link,
  Mail,
  MessageCircle,
  Users,
  User,
  Home,
  Building,
  Map,
  Navigation,
  Plane,
  Car,
  Coffee,
  Utensils,
  Pizza,
  Dumbbell,
  Bike,
  Trophy,
  Target,
  Palette,
  Pencil,
  type LucideIcon,
} from 'lucide-react';
import { Input } from '../ui';

const ICON_MAP: Record<string, LucideIcon> = {
  folder: Folder,
  code: Code,
  video: Video,
  music: Music,
  image: Image,
  'file-text': FileText,
  'book-open': BookOpen,
  briefcase: Briefcase,
  'shopping-cart': ShoppingCart,
  heart: Heart,
  star: Star,
  bookmark: Bookmark,
  tag: Tag,
  globe: Globe,
  newspaper: Newspaper,
  'graduation-cap': GraduationCap,
  lightbulb: Lightbulb,
  wrench: Wrench,
  gamepad: Gamepad2,
  film: Film,
  camera: Camera,
  mic: Mic,
  headphones: Headphones,
  tv: Tv,
  monitor: Monitor,
  smartphone: Smartphone,
  laptop: Laptop,
  database: Database,
  cloud: Cloud,
  lock: Lock,
  link: Link,
  mail: Mail,
  'message-circle': MessageCircle,
  users: Users,
  user: User,
  home: Home,
  building: Building,
  map: Map,
  navigation: Navigation,
  plane: Plane,
  car: Car,
  coffee: Coffee,
  utensils: Utensils,
  pizza: Pizza,
  dumbbell: Dumbbell,
  bike: Bike,
  trophy: Trophy,
  target: Target,
  palette: Palette,
  pencil: Pencil,
};

const ICON_NAMES = Object.keys(ICON_MAP);

interface IconPickerProps {
  value: string;
  onChange: (icon: string) => void;
  className?: string;
}

const IconPicker = memo(function IconPicker({
  value,
  onChange,
  className = '',
}: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredIcons = useMemo(() => {
    if (!search.trim()) return ICON_NAMES;
    const searchLower = search.toLowerCase();
    return ICON_NAMES.filter((name) => name.includes(searchLower));
  }, [search]);

  return (
    <div className={`space-y-2 ${className}`}>
      <label className="block text-sm font-medium text-gray-700">아이콘</label>
      <Input
        placeholder="아이콘 검색..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <div className="max-h-40 overflow-y-auto border border-gray-200 rounded-lg p-2">
        <div className="grid grid-cols-8 gap-1">
          {filteredIcons.map((name) => {
            const Icon = ICON_MAP[name];
            return (
              <button
                key={name}
                type="button"
                onClick={() => onChange(name)}
                className={`
                  p-2 rounded-lg flex items-center justify-center
                  transition-colors hover:bg-gray-100
                  focus:outline-none focus:ring-2 focus:ring-indigo-500
                  ${value === name ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600'}
                `}
                title={name}
                aria-label={`아이콘 ${name}`}
                aria-pressed={value === name}
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          })}
        </div>
        {filteredIcons.length === 0 && (
          <p className="text-center text-sm text-gray-500 py-4">
            검색 결과가 없습니다
          </p>
        )}
      </div>
    </div>
  );
});

export { IconPicker, ICON_MAP, ICON_NAMES };
export type { IconPickerProps };
