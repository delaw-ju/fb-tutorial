import { NextPage } from 'next';
import ServiceLayout from '@/components/service_layout';
import { useAuth } from '@/contexts/auth_user.context';

const IndexPage: NextPage = function () {
  const { signInWithGoogle } = useAuth();
  return (
    <ServiceLayout title="test" minH="100vh" backgroundColor="gray.50">
      <button onClick={signInWithGoogle}>구글 로그인</button>
    </ServiceLayout>
  );
};

export default IndexPage;
