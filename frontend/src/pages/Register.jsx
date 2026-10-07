import AuthContainer from '../components/AuthContainer';

const Register = () => {
  return (
    <div className="min-h-[calc(100vh-140px)] flex items-center justify-center py-space-md">
      <AuthContainer defaultMode="register" />
    </div>
  );
};

export default Register;
