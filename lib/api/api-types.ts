export type Project = {
  id: string;
  name: string;
  description?: string;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type LoginResponse = {
  access_token?: string;
  accessToken?: string;
  refresh_token?: string;
  refreshToken?: string;
  token?: string;
  userId?: string | number;
  id?: string | number;
  user?: {
    id?: string | number;
  };
};

export type UpdateProjectDto = {
  name: string;
  description?: string;
};

export type createProjectDto = UpdateProjectDto;

export type Task = {
  id: string;
  name: string;
  title?: string;
  description?: string;
  position: number;
  userCreatorId?: string;
  projectId: string;
  stepId?: string;
  createdAt?: string;
  updateAt?: string;
};

export type CreateTaskDto = {
  name: string;
  stepId: string;
  description?: string;
  position?: number;
};

export type UpdateTaskDto = Partial<CreateTaskDto>;

export type Step = {
  id: string;
  name: string;
  title?: string;
  cards?: Task[];
  projectId?: string | null;
  position?: number;
}

export type createStepDto = {
  name: string;
  projectId: string;
  position?: number;
}

export type UpdateStepDto = Partial<Omit<createStepDto, 'projectId'>>;
