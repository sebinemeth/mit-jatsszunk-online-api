export type GameChangeRequest = {
  fields: [
    {
      name: string;
      valueFrom: any;
      valueTo: any;
    }
  ];
  authorId: string;
  createdAt: string;
  approvedAt: string | null;
  deniedAt: string | null;
  moderatorId: string | null;
};

export type Game = {
  
}