import Header from '../components/Header';
import AuthForm from '../components/AuthForm';

export default function Signup() {
  return (
    <div className="auth-page">
      <Header variant="plain" />
      <main className="auth-page__main"><AuthForm mode="signup" /></main>
    </div>
  );
}
