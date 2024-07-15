import { AuthFormTemplate } from '@/features/authentication/components/auth-form-template';

const SignInPage: React.FC = () => {
  return (
    <div className="flex h-screen flex-col items-center justify-center gap-2">
      <img
        src="https://cdn.activepieces.com/brand/full-logo.png"
        alt="activepieces-logo"
        width={205}
        height={205}
      />
      <AuthFormTemplate form="signin" />
    </div>
  );
};
SignInPage.displayName = 'SignInPage';

export { SignInPage };
