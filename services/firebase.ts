import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  updateProfile,
  User 
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDoc, 
  getDocs, 
  doc, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  serverTimestamp,
  onSnapshot,
  deleteDoc
} from 'firebase/firestore';
import {
  FIREBASE_API_KEY,
  FIREBASE_AUTH_DOMAIN,
  FIREBASE_PROJECT_ID,
  FIREBASE_STORAGE_BUCKET,
  FIREBASE_MESSAGING_SENDER_ID,
  FIREBASE_APP_ID
} from '@env';

// Initialize Firebase
const firebaseConfig = {
  apiKey: FIREBASE_API_KEY,
  authDomain: FIREBASE_AUTH_DOMAIN,
  projectId: FIREBASE_PROJECT_ID,
  storageBucket: FIREBASE_STORAGE_BUCKET,
  messagingSenderId: FIREBASE_MESSAGING_SENDER_ID,
  appId: FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Authentication functions
export const signUp = async (email: string, password: string, displayName: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName });
    
    // Create user profile in Firestore
    await addDoc(collection(db, 'users'), {
      uid: userCredential.user.uid,
      email,
      displayName,
      createdAt: serverTimestamp(),
      preferences: {
        dietaryRestrictions: [],
        dietGoals: [],
        calorieTarget: 2000,
        macroTargets: {
          protein: 25,
          carbs: 50,
          fat: 25
        }
      }
    });
    
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return userCredential.user;
  } catch (error) {
    throw error;
  }
};

export const signOut = async () => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = () => {
  return auth.currentUser;
};

export const listenToAuthState = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};

// Firestore functions
export const addMeal = async (userId: string, mealData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'meals'), {
      userId,
      ...mealData,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getMeals = async (userId: string, days = 7) => {
  try {
    const date = new Date();
    date.setDate(date.getDate() - days);
    
    const mealsQuery = query(
      collection(db, 'meals'),
      where('userId', '==', userId),
      where('timestamp', '>=', date),
      orderBy('timestamp', 'desc')
    );
    
    const snapshot = await getDocs(mealsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export const getMealById = async (mealId: string) => {
  try {
    const docRef = doc(db, 'meals', mealId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    } else {
      return null;
    }
  } catch (error) {
    throw error;
  }
};

export const updateMeal = async (mealId: string, data: any) => {
  try {
    const docRef = doc(db, 'meals', mealId);
    await updateDoc(docRef, data);
    return true;
  } catch (error) {
    throw error;
  }
};

export const deleteMeal = async (mealId: string) => {
  try {
    const docRef = doc(db, 'meals', mealId);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    throw error;
  }
};

export const getUserProfile = async (userId: string) => {
  try {
    const userQuery = query(
      collection(db, 'users'),
      where('uid', '==', userId)
    );
    
    const snapshot = await getDocs(userQuery);
    if (!snapshot.empty) {
      return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() };
    }
    return null;
  } catch (error) {
    throw error;
  }
};

export const updateUserPreferences = async (userDocId: string, preferences: any) => {
  try {
    const docRef = doc(db, 'users', userDocId);
    await updateDoc(docRef, { preferences });
    return true;
  } catch (error) {
    throw error;
  }
};

export const saveTip = async (userId: string, tipData: any) => {
  try {
    const docRef = await addDoc(collection(db, 'tips'), {
      userId,
      ...tipData,
      createdAt: serverTimestamp(),
      saved: true
    });
    return docRef.id;
  } catch (error) {
    throw error;
  }
};

export const getSavedTips = async (userId: string) => {
  try {
    const tipsQuery = query(
      collection(db, 'tips'),
      where('userId', '==', userId),
      where('saved', '==', true),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(tipsQuery);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    throw error;
  }
};

export { db, auth };