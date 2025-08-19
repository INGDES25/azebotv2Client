// Store pour gérer le contenu publié par l'admin
import { db } from "@/integrations/firebase/client";
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  orderBy,
  doc,
  getDoc,
  onSnapshot,
  type DocumentData
} from "firebase/firestore";

export interface TradingAnalysis {
  id: string;
  asset: string;
  images: string[];
  technicalAnalysis: string;
  fundamentalAnalysis: string;
  signals: string;
  reasoning: string;
  summary: string;
  publishedAt: string;
}

export interface PronosticAnalysis {
  id: string;
  match: string;
  images: string[];
  analysis: string;
  predictions: string;
  coupon: string;
  publishedAt: string;
}

export interface HomeContent {
  id: string;
  content: string;
  type: 'forex' | 'football';
  publishedAt: string;
}

class ContentStore {
  private tradingAnalyses: TradingAnalysis[] = [];
  private pronosticAnalyses: PronosticAnalysis[] = [];
  private homeContents: HomeContent[] = [];

  constructor() {
    this.setupRealtimeListeners();
  }

  private setupRealtimeListeners() {
    // Trading analyses
    const tradingQuery = query(
      collection(db, 'tradingAnalyses'),
      orderBy('publishedAt', 'desc')
    );
    
    onSnapshot(tradingQuery, (snapshot) => {
      this.tradingAnalyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as TradingAnalysis));
    });

    // Pronostic analyses
    const pronosticQuery = query(
      collection(db, 'pronosticAnalyses'),
      orderBy('publishedAt', 'desc')
    );
    
    onSnapshot(pronosticQuery, (snapshot) => {
      this.pronosticAnalyses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as PronosticAnalysis));
    });

    // Home contents
    const homeQuery = query(
      collection(db, 'homeContents'),
      orderBy('publishedAt', 'desc')
    );
    
    onSnapshot(homeQuery, (snapshot) => {
      this.homeContents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as HomeContent));
    });
  }

  // Méthodes pour Trading
  getTradingAnalyses(): TradingAnalysis[] {
    return this.tradingAnalyses;
  }

  async saveTradingAnalysis(analysis: Omit<TradingAnalysis, 'id' | 'publishedAt'>) {
    const newAnalysis = {
      ...analysis,
      publishedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'tradingAnalyses'), newAnalysis);
    return {
      id: docRef.id,
      ...newAnalysis
    } as TradingAnalysis;
  }

  getLatestTradingAnalysis(): TradingAnalysis | null {
    return this.tradingAnalyses.length > 0 ? this.tradingAnalyses[0] : null;
  }

  // Méthodes pour Pronostics
  getPronosticAnalyses(): PronosticAnalysis[] {
    return this.pronosticAnalyses;
  }

  async savePronosticAnalysis(analysis: Omit<PronosticAnalysis, 'id' | 'publishedAt'>) {
    const newAnalysis = {
      ...analysis,
      publishedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'pronosticAnalyses'), newAnalysis);
    return {
      id: docRef.id,
      ...newAnalysis
    } as PronosticAnalysis;
  }

  getLatestPronosticAnalysis(): PronosticAnalysis | null {
    return this.pronosticAnalyses.length > 0 ? this.pronosticAnalyses[0] : null;
  }

  // Méthodes pour Home
  getHomeContents(): HomeContent[] {
    return this.homeContents;
  }

  async saveHomeContent(content: string, type: 'forex' | 'football') {
    const newContent = {
      content,
      type,
      publishedAt: new Date().toISOString()
    };
    
    const docRef = await addDoc(collection(db, 'homeContents'), newContent);
    return {
      id: docRef.id,
      ...newContent
    } as HomeContent;
  }

  getLatestHomeContent(): HomeContent | null {
    return this.homeContents.length > 0 ? this.homeContents[0] : null;
  }
}

export const contentStore = new ContentStore();
