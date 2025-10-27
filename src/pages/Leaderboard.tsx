import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Trophy, Award, Medal } from "lucide-react";

interface LeaderboardEntry {
  username: string;
  total_emissions: number;
  coins: number;
  rank?: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const [leaders, setLeaders] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
    loadLeaderboard();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      navigate("/auth");
    }
  };

  const loadLeaderboard = async () => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, total_emissions, coins")
      .order("total_emissions", { ascending: true })
      .limit(10);

    if (error) {
      console.error("Failed to load leaderboard", error);
    } else {
      const rankedData = data.map((entry, index) => ({
        ...entry,
        rank: index + 1,
      }));
      setLeaders(rankedData);
    }
    setLoading(false);
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Medal className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <Award className="w-6 h-6 text-muted-foreground" />;
    }
  };

  const getRankBadge = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500 text-white";
      case 2:
        return "bg-gray-400 text-white";
      case 3:
        return "bg-amber-600 text-white";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen gradient-earth p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-soft">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 gradient-eco rounded-full flex items-center justify-center mb-4">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-3xl">Global Leaderboard</CardTitle>
            <CardDescription>Top eco-warriors with lowest carbon footprints</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaders.map((leader) => (
                <div
                  key={leader.username}
                  className={`flex items-center gap-4 p-4 rounded-lg transition-all ${
                    leader.rank && leader.rank <= 3
                      ? "bg-gradient-to-r from-primary/10 to-accent/10 shadow-glow"
                      : "bg-muted/50"
                  }`}
                >
                  <Badge className={`${getRankBadge(leader.rank || 0)} text-lg px-3 py-1`}>
                    #{leader.rank}
                  </Badge>

                  <div className="flex items-center gap-3 flex-1">
                    {getRankIcon(leader.rank || 0)}
                    
                    <Avatar>
                      <AvatarFallback className="gradient-eco text-white">
                        {leader.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1">
                      <p className="font-semibold">{leader.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {leader.total_emissions.toFixed(2)} kg CO₂
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1">
                        <Award className="w-4 h-4 text-primary" />
                        <span className="font-bold text-primary">{leader.coins}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">coins</p>
                    </div>
                  </div>
                </div>
              ))}

              {leaders.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <Trophy className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No rankings yet. Start tracking to be the first!</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-soft gradient-eco text-white">
          <CardHeader>
            <CardTitle>🏆 How Rankings Work</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Lower emissions = Higher rank</p>
            <p>• Track consistently to improve your position</p>
            <p>• Earn bonus coins for top 3 positions</p>
            <p>• Rankings update in real-time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Leaderboard;
