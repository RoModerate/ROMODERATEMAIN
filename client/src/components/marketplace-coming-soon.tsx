import { useEffect, useState } from "react";

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export function MarketplaceComingSoon() {
  // Set launch date to 37 days from now
  const launchDate = new Date();
  launchDate.setDate(launchDate.getDate() + 37);
  
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime();
      const distance = launchDate.getTime() - now;

      if (distance > 0) {
        setTimeRemaining({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    };

    calculateTimeRemaining();
    const timer = setInterval(calculateTimeRemaining, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-5xl text-center space-y-16">
        
        {/* Header */}
        <div className="space-y-4">
          <h1 className="text-7xl md:text-8xl font-bold text-foreground tracking-tight">
            Marketplace
          </h1>
          <p className="text-2xl text-muted-foreground">
            Launching Soon
          </p>
        </div>

        {/* Countdown */}
        <div data-testid="card-countdown">
          <div className="grid grid-cols-4 gap-8 md:gap-12 mb-6">
            <div data-testid="countdown-days" className="space-y-3">
              <div className="text-7xl md:text-8xl font-bold text-foreground tabular-nums">
                {String(timeRemaining.days).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">
                Days
              </div>
            </div>
            
            <div data-testid="countdown-hours" className="space-y-3">
              <div className="text-7xl md:text-8xl font-bold text-foreground tabular-nums">
                {String(timeRemaining.hours).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">
                Hours
              </div>
            </div>
            
            <div data-testid="countdown-minutes" className="space-y-3">
              <div className="text-7xl md:text-8xl font-bold text-foreground tabular-nums">
                {String(timeRemaining.minutes).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">
                Minutes
              </div>
            </div>
            
            <div data-testid="countdown-seconds" className="space-y-3">
              <div className="text-7xl md:text-8xl font-bold text-foreground tabular-nums">
                {String(timeRemaining.seconds).padStart(2, '0')}
              </div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">
                Seconds
              </div>
            </div>
          </div>

          {/* Separator */}
          <div className="flex items-center justify-center gap-3 my-8">
            <div className="h-px w-24 bg-border" />
            <div className="h-1.5 w-1.5 rounded-full bg-primary" />
            <div className="h-px w-24 bg-border" />
          </div>
        </div>

        {/* Features */}
        <div className="max-w-3xl mx-auto">
          <p className="text-lg text-muted-foreground mb-8">
            A secure platform for Roblox asset trading
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center mx-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="text-foreground">Escrow Protection</div>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center mx-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="text-foreground">Verified Sellers</div>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center mx-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="text-foreground">Live Auctions</div>
            </div>
            
            <div className="space-y-2">
              <div className="h-10 w-10 rounded-full bg-card/50 backdrop-blur-sm border border-border flex items-center justify-center mx-auto">
                <div className="h-2 w-2 rounded-full bg-primary" />
              </div>
              <div className="text-foreground">Anti-Scam</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
