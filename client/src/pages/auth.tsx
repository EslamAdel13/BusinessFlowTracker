import { Helmet } from 'react-helmet';
import AuthForm from '@/components/auth/AuthForm';

const Auth = () => {
  return (
    <>
      <Helmet>
        <title>Sign In - ProjectSync</title>
        <meta name="description" content="Sign in to ProjectSync - A Gantt-style timeline management tool for business analysts and project managers." />
      </Helmet>
      <AuthForm />
    </>
  );
};

export default Auth;
