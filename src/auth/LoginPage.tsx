import { Link } from "react-router";
import { LoginForm } from "wasp/client/auth";

export function LoginPage() {
  return (
    <div className="mx-auto max-w-sm py-8">
      <LoginForm />
      <p className="mt-4 text-center text-sm text-stone-500">
        No account?{" "}
        <Link to="/signup" className="underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
