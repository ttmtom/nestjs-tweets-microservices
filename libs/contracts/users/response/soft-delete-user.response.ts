export type TSoftDeleteUserResponseDTO = {
  success: boolean;
  user: {
    id: string;
    idHash: string;
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth: Date;
    createdAt: Date;
    updatedAt: Date;
    deletedAt?: Date;
  };
};
