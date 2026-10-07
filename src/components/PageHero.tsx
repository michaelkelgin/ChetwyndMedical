type PageHeroProps = {
  title: string;
  lead?: string;
};

export default function PageHero({ title, lead }: PageHeroProps) {
  return (
    <header className="page-hero">
      <div className="page-hero__inner">
        <h1>{title}</h1>
        {lead ? <p className="page-hero__lead">{lead}</p> : null}
      </div>
    </header>
  );
}
