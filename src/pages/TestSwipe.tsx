import { SimpleSwipeContainer } from '@/components/SimpleSwipeContainer';

export default function TestSwipe() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent mb-2">
            TEST PAGE - Simple Swipe
          </h1>
          <p className="text-gray-600">Swipe right to save, left to pass</p>
          <p className="text-sm text-gray-500 mt-2">Direct test page (no auth required)</p>
        </div>

        <SimpleSwipeContainer />
      </div>
    </div>
  );
}
