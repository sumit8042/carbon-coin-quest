import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Leaf, TrendingDown, Award, Users } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      setIsLoggedIn(true);
    }
  };

  return (
    <div className="min-h-screen gradient-earth">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20 text-center">
        <div className="max-w-4xl mx-auto space-y-8">
          <div className="w-20 h-20 gradient-eco rounded-full flex items-center justify-center mx-auto animate-float shadow-glow">
            <Leaf className="w-10 h-10 text-white" />
          </div>

          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-accent">
            EcoTracker
          </h1>

          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Track your carbon footprint, compete with friends, and earn rewards for a greener lifestyle
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            {isLoggedIn ? (
              <Button
                size="lg"
                className="gradient-eco text-white shadow-glow text-lg px-8 py-6"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
            ) : (
              <>
                <Button
                  size="lg"
                  className="gradient-eco text-white shadow-glow text-lg px-8 py-6"
                  onClick={() => navigate("/auth")}
                >
                  Get Started
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6"
                  onClick={() => navigate("/auth")}
                >
                  Login
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          <Card className="shadow-soft hover:shadow-glow transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 gradient-eco rounded-full flex items-center justify-center mx-auto">
                <TrendingDown className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Track Emissions</h3>
              <p className="text-muted-foreground">
                Calculate your carbon footprint from travel, electricity, and food consumption
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 gradient-eco rounded-full flex items-center justify-center mx-auto">
                <Award className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Earn Rewards</h3>
              <p className="text-muted-foreground">
                Get eco-coins for logging emissions and reducing your carbon footprint
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-soft hover:shadow-glow transition-all">
            <CardContent className="pt-6 text-center space-y-4">
              <div className="w-16 h-16 gradient-eco rounded-full flex items-center justify-center mx-auto">
                <Users className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold">Global Leaderboard</h3>
              <p className="text-muted-foreground">
                Compete with eco-warriors worldwide and climb the rankings
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <Card className="shadow-soft gradient-eco text-white">
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold mb-2">🌍</div>
                  <div className="text-3xl font-bold">Track</div>
                  <p className="text-sm opacity-90">Your Carbon Impact</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">🏆</div>
                  <div className="text-3xl font-bold">Compete</div>
                  <p className="text-sm opacity-90">With Global Leaders</p>
                </div>
                <div>
                  <div className="text-4xl font-bold mb-2">🪙</div>
                  <div className="text-3xl font-bold">Earn</div>
                  <p className="text-sm opacity-90">Eco-Coin Rewards</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* CTA Section */}
      {!isLoggedIn && (
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-2xl mx-auto space-y-6">
            <h2 className="text-4xl font-bold">Ready to make a difference?</h2>
            <p className="text-xl text-muted-foreground">
              Join thousands of eco-warriors tracking their carbon footprint
            </p>
            <Button
              size="lg"
              className="gradient-eco text-white shadow-glow text-lg px-8 py-6"
              onClick={() => navigate("/auth")}
            >
              Start Tracking Today
            </Button>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t mt-20">
        <div className="container mx-auto px-4 py-8 text-center text-muted-foreground">
          <p>© 2024 EcoTracker. Making the world greener, one track at a time.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
