import { getCategoryImage } from "@/lib/images";

export const MARKETING_CATEGORIES = [
  {
    slug: "world-cup-2026",
    name: "World Cup 2026",
    tagline: "USA · Canada · Mexico",
    description: "Every match, every stadium — from group stage to the final.",
    href: "/world-cup-2026",
    image: getCategoryImage("world-cup-2026"),
    color: "from-emerald-500 to-teal-600",
  },
  {
    slug: "premier-league",
    name: "Premier League",
    tagline: "English football",
    description: "Top clubs, iconic stadiums, unforgettable atmospheres.",
    href: "/events?competition=premier-league",
    image: getCategoryImage("premier-league"),
    color: "from-violet-500 to-purple-600",
  },
  {
    slug: "nba",
    name: "NBA",
    tagline: "Basketball",
    description: "Courtside energy from the biggest arenas in America.",
    href: "/events?competition=nba",
    image: getCategoryImage("nba"),
    color: "from-orange-500 to-red-500",
  },
  {
    slug: "concerts",
    name: "Concerts & Festivals",
    tagline: "Live music",
    description: "Stadium tours, festivals, and once-in-a-lifetime shows.",
    href: "/concerts",
    image: getCategoryImage("concerts"),
    color: "from-pink-500 to-rose-600",
  },
];
