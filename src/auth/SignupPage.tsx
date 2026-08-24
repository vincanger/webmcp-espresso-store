import { Link } from "react-router";
import { SignupForm } from "wasp/client/auth";

export function SignupPage() {
  return (
    <div className="mx-auto max-w-sm py-8">
      <SignupForm />
      <p className="mt-4 text-center text-sm text-stone-500">
        Already have an account?{" "}
        <Link to="/login" className="underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
