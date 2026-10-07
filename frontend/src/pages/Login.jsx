import AuthContainer from '../components/AuthContainer';

const Login = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-space-md">
      <AuthContainer defaultMode="signin" />
    </div>
  );
};

export default Login;
