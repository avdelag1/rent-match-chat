import { TinderentSwipeContainer } from '@/components/TinderentSwipeContainer';

export default function TestSwipe() {
  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-background to-secondary flex items-center justify-center p-4">
      <div className="w-full max-w-2xl h-screen">
        <div className="text-center mb-4 pt-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-2">
            Tinder-Style Swipe Test
          </h1>
          <p className="text-muted-foreground">Swipe right to like, left to pass, up for priority</p>
          <p className="text-sm text-muted-foreground/70 mt-1">Full-screen immersive experience</p>
        </div>

        <TinderentSwipeContainer 
        />
      </div>
    </div>
  );
}
