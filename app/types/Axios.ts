export interface ResponseProps {
  message?: string;
  redirect?: string;
  isFollowed: boolean;
}

export interface ErrorProps {
  error: ErrorDetailProps;
}

export interface ErrorDetailProps {
  name: string;
  message: FormErrorProps[] | string;
  redirect?: string;
}

export interface FormErrorProps {
  fieldName: string;
  fieldMessage: string;
}
