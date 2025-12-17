export interface Review {
  full_name: string;
  created_at: string;
  rating: number;
  comment: string;
  image?: string;
}

export const mockReviews: Review[] = [
  {
    full_name: "John Doe",
    created_at: "2025-05-10T12:00:00Z",
    rating: 5,
    comment: "Amazing food and great service!",
    image: "/images/profile1.jpg",
  },
  {
    full_name: "Jane Smith",
    created_at: "2025-05-09T14:30:00Z",
    rating: 4,
    comment: "Really enjoyed the ambiance.",
    image: "",
  },
  {
    full_name: "Mike Johnson",
    created_at: "2025-05-08T08:45:00Z",
    rating: 3,
    comment: "It was okay, nothing special.",
  },
];
