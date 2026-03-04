import LoginForm from '@/components/forms/LoginForm';

export default function LoginPage() {
  return (
    <div className="container mx-auto flex min-h-[calc(100vh-10rem)] items-center justify-center py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-headline font-bold">Welcome</h1>
          <p className="text-muted-foreground mt-2">
            Sign in or create an account to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
