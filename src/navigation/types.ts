export type AuthStackParamList = {
  Login: undefined;
  Signup: undefined;
};

export type AppStackParamList = {
  Tasks: undefined;
  TaskDetails: {
    taskId: string;
  };
  TaskForm:
    | {
        taskId?: string;
      }
    | undefined;
  Settings: undefined;
};
