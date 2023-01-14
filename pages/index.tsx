import { NextPage } from 'next';
import { GoogleAuthProvider, signInWithPopup } from '@firebase/auth';
import ServiceLayout from '@/components/service_layout';
import FirebaseClient from '@/models/firebase_client';

const provider = new GoogleAuthProvider();
const IndexPage: NextPage = function () {
  return (
    <ServiceLayout title="test">
      <button
        onClick={async () => {
          const result = await signInWithPopup(FirebaseClient.getInstance().Auth, provider);
          console.log(result);
        }}
      >
        구글 로그인
      </button>
    </ServiceLayout>
  );
};

export default IndexPage;
