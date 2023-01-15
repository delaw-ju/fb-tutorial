import * as admin from 'firebase-admin';
import * as process from 'process';

interface Config {
  credential: {
    privateKey: string;
    clientEmail: string;
    projectId: string;
  };
}

export default class FirebaseAdmin {
  public static instance: FirebaseAdmin;

  private init = false;

  public get Firestore(): FirebaseFirestore.Firestore {
    if (!this.init) this.bootstrap();

    return admin.firestore();
  }

  public get Auth(): admin.auth.Auth {
    if (!this.init) this.bootstrap();
    return admin.auth();
  }

  public static getInstance(): FirebaseAdmin {
    if (FirebaseAdmin.instance === undefined || FirebaseAdmin.instance === null) {
      FirebaseAdmin.instance = new FirebaseAdmin();
    }
    return FirebaseAdmin.instance;
  }

  private bootstrap(): void {
    const haveApp = admin.apps.length !== 0;
    if (haveApp) {
      this.init = true;
      return;
    }

    const config: Config = {
      credential: {
        projectId: process.env.PROJECT_ID || '',
        clientEmail: process.env.CLIENT_EMAIL || '',
        privateKey: (process.env.PRIVATE_KEY || '').replace(/\\n/g, '\n'),
      },
    };

    admin.initializeApp({ credential: admin.credential.cert(config.credential) });
    console.log('bootstrap firebase admin');
  }
}
