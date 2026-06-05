export function PageStub({ title, note }: { title: string; note?: string }) {
  return (
    <section className="container py-24">
      <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
      <p className="mt-4 max-w-2xl text-muted-foreground">
        {note ?? 'Scaffold stub — see docs/plans for the build sequence.'}
      </p>
    </section>
  );
}
