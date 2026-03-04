import CreatorApplicationForm from '@/components/forms/CreatorApplicationForm';

export default function ApplyPage() {
  return (
    <div className="container mx-auto max-w-2xl py-12">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-headline font-bold">Become a Creator</h1>
        <p className="text-muted-foreground mt-2">
          Share your stories with the world. Fill out the application below to get started.
        </p>
      </div>
      <CreatorApplicationForm />
    </div>
  );
}
