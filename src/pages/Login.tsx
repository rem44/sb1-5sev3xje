// src/pages/Login.tsx
import React, { useState } from 'react';
import { Navigate, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Layout as LayoutIcon } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signIn, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Si l'utilisateur est déjà connecté, rediriger vers la page d'accueil
  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await signIn(email, password);

      // Rediriger vers la page demandée ou la page d'accueil
      const from = (location.state as any)?.from?.pathname || "/";
      navigate(from, { replace: true });
    } catch (error) {
      setError('Email ou mot de passe incorrect');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-[#0C3B5E]">
            <LayoutIcon className="h-8 w-8 text-white" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
            Connectez-vous à votre compte
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Venture Claims Management
          </p>
        </div>

        {/* Formulaire de connexion */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Adresse email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Adresse email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <div className="flex">
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">{error}</h3>
                </div>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-[#0C3B5E] focus:ring-[#0C3B5E] border-gray-300 rounded"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                Se souvenir de moi
              </label>
            </div>

            <div className="text-sm">
              <a href="#" className="font-medium text-[#0C3B5E] hover:text-blue-800">
                Mot de passe oublié ?
              </a>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#0C3B5E] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${isLoading ? 'opacity-75 cursor-wait' : 'hover:bg-blue-800'}`}
            >
              {isLoading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </div>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Démonstration: utilisez demo@example.com / password
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
