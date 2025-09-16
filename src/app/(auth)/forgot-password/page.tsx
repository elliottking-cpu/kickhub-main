export default function ForgotPasswordPage() {
  return (
    <div className="bg-white p-8 rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold text-center mb-6">Reset Password</h1>
      <div className="space-y-4">
        <p className="text-center text-gray-600">
          Enter your email to receive password reset instructions
        </p>
        <div className="text-center">
          <p className="text-sm text-gray-500">Password reset coming soon...</p>
        </div>
      </div>
    </div>
  );
}