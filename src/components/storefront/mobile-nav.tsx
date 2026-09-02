import Link from "next/link";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

type MobileNavProps = {
  siteName: string;
  links: { label: string; href: string }[];
  categories: { name: string; slug: string }[];
  light?: boolean;
};

export function MobileNav({ siteName, links, categories, light }: MobileNavProps) {
  return (
    <Sheet>
      <SheetTrigger
        className={`inline-flex size-9 items-center justify-center rounded-md transition-colors hover:bg-muted md:hidden ${
          light ? "text-background" : "text-foreground"
        }`}
        aria-label="Menüyü aç"
      >
        <Menu className="size-5" />
      </SheetTrigger>
      <SheetContent side="left" className="w-80 gap-0 overflow-y-auto">
        <SheetTitle className="px-6 pt-6 font-heading text-lg font-medium tracking-wide">
          {siteName}
        </SheetTitle>
        <nav className="flex flex-col px-6 py-4">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="border-b border-border py-3 text-sm text-foreground transition-colors hover:text-accent"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="px-6 pb-8">
          <p className="text-xs font-medium tracking-widest text-muted-foreground uppercase">
            Kategoriler
          </p>
          <nav className="mt-2 flex flex-col">
            {categories.map((category) => (
              <Link
                key={category.slug}
                href={`/kategori/${category.slug}`}
                className="py-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                {category.name}
              </Link>
            ))}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
