export default function PlaceholderNote({ children }: { children: React.ReactNode }) {
  return (
    <aside className="placeholder-note" role="note">
      <span className="placeholder-note__label">Placeholder</span>
      <p>{children}</p>
    </aside>
  );
}
