export interface Template {
  id: string;
  name: string;
  category: string;
  difficulty: "Easy" | "Medium" | "Hard";
  rating: string;
  description: string;
  author: string;
  uses: number;
  createdAt: string;
  senderName: string;
  senderEmail: string;
  subject: string;
  emailBody: string;
  clickRate: string;
  successRate: string;
}
