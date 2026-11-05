export default function Footer() {
  return (
    <footer className="flex shrink-0 justify-between gap-4 border-t border-border bg-muted/30 px-4 py-2 text-xs text-muted-foreground md:px-6">
      <span>© {new Date().getFullYear()} LittleHorse Enterprises LLC</span>
      <span>Business Console</span>
    </footer>
  );
}
