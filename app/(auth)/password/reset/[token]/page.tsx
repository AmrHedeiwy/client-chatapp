import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import PasswordResetForm from './components/PasswordResetForm';

export default function PasswordReset() {
  return (
    <div className="flex min-h-full justify-center items-center">
      <Card className=" w-11/12 md:w-[450px]">
        <CardHeader>
          <div className="flex justify-center text-lg ">
            <CardTitle>Reset your password</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <PasswordResetForm />
        </CardContent>
      </Card>
    </div>
  );
}
