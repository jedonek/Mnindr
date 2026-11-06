import { createBrowserRouter, ScrollRestoration } from 'react-router-dom';
import { AuthLayout, ProtectedLayout, PublicLayout, Root } from '@/components/layout/Layouts';
import { Chat } from '@/pages/Chat';
import { Discover } from '@/pages/Discover';
import { ForgotPassword } from '@/pages/ForgotPassword';
import { HowItWorks } from '@/pages/HowItWorks';
import { Landing } from '@/pages/Landing';
import { Legal } from '@/pages/Legal';
import { Login } from '@/pages/Login';
import { NotFound } from '@/pages/NotFound';
import { Preferences } from '@/pages/Preferences';
import { ProfileEdit } from '@/pages/ProfileEdit';
import { Register, RegisterFlow, RegisterPetInfo } from '@/pages/Register';
import { Rules } from '@/pages/Rules';
import { Support } from '@/pages/Support';
import { VerifyCode } from '@/pages/VerifyCode';

function RootWithScroll() {
  return (
    <>
      <Root />
      <ScrollRestoration />
    </>
  );
}

export const router = createBrowserRouter([
  {
    element: <RootWithScroll />,
    children: [
      // Veřejné
      {
        element: <PublicLayout />,
        children: [
          { path: '/', element: <Landing /> },
          { path: '/how-it-works', element: <HowItWorks /> },
          { path: '/support', element: <Support /> },
          { path: '/rules', element: <Rules /> },
          { path: '/terms', element: <Legal kind="terms" /> },
          { path: '/privacy', element: <Legal kind="privacy" /> },
        ],
      },
      // Auth (jen pro nepřihlášené)
      {
        element: <AuthLayout />,
        children: [
          {
            path: '/register',
            element: <RegisterFlow />,
            handle: { mascot: 'girl' },
            children: [
              { index: true, element: <Register /> },
              { path: 'pet-info', element: <RegisterPetInfo /> },
            ],
          },
          { path: '/login', element: <Login />, handle: { mascot: 'boy' } },
          { path: '/forgot-password', element: <ForgotPassword />, handle: { mascot: 'boy' } },
          { path: '/verify-code', element: <VerifyCode />, handle: { mascot: 'boy' } },
        ],
      },
      // Aplikace (jen pro přihlášené)
      {
        element: <ProtectedLayout />,
        children: [
          { path: '/discover', element: <Discover /> },
          { path: '/chat', element: <Chat /> },
          { path: '/profile/edit', element: <ProfileEdit /> },
          { path: '/profile/preferences', element: <Preferences /> },
        ],
      },
      { path: '*', element: <NotFound /> },
    ],
  },
]);
