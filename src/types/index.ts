export interface Task {
  id: string;
  title: string;
  description: string;
  budget: number;
  category: string;
  location: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  status: string;
  priority?: string;
  createdAt: string;
  expiryDate?: string;
  client: {
    id: string;
    name: string;
    clientRating: number;
    clientRatingCount: number;
    idVerificationStatus: string;
  };
}

export interface User {
  id: string;
  name: string;
  email: string;
  token: string;
  taskerRating: number;
  clientRating: number;
  isSubscriber: boolean;
  profilePhoto?: string;
}

export type SwipeDirection = 'left' | 'right';
