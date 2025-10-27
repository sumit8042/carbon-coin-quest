import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Award, TrendingDown, Calendar, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface Profile {
  username: string;
  coins: number;
  total_emissions: number;
  created_at: string;
}

interface Emission {
  id: string;
  date: string;
  category: string;
  amount: number;
  created_at: string;
}

const Profile = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    setUserId(session.user.id);
    await loadProfile(session.user.id);
    await loadEmissions(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, coins, total_emissions, created_at")
      .eq("user_id", userId)
      .single();

    if (error) {
      toast.error("Failed to load profile");
      return;
    }

    setProfile(data);
  };

  const loadEmissions = async (userId: string) => {
    const { data, error } = await supabase
      .from("emissions")
      .select("id, date, category, amount, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(10);

    if (error) {
      toast.error("Failed to load emissions");
      return;
    }

    setEmissions(data);
  };

  const handleDeleteEmission = async (emissionId: string) => {
    if (!userId) return;

    const { error } = await supabase
      .from("emissions")
      .delete()
      .eq("id", emissionId);

    if (error) {
      toast.error("Failed to delete emission");
      return;
    }

    toast.success("Emission deleted successfully");
    await loadProfile(userId);
    await loadEmissions(userId);
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "travel":
        return "bg-blue-500";
      case "electricity":
        return "bg-yellow-500";
      case "food":
        return "bg-green-500";
      default:
        return "bg-gray-500";
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

        {/* Profile Card */}
        <Card className="shadow-soft">
          <CardHeader className="text-center">
            <Avatar className="w-24 h-24 mx-auto mb-4">
              <AvatarFallback className="gradient-eco text-white text-3xl">
                {profile?.username.substring(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <CardTitle className="text-3xl">{profile?.username}</CardTitle>
            <CardDescription className="flex items-center justify-center gap-2">
              <Calendar className="w-4 h-4" />
              Member since {new Date(profile?.created_at || "").toLocaleDateString()}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-primary/10 to-accent/10">
                <TrendingDown className="w-8 h-8 mx-auto mb-2 text-primary" />
                <div className="text-3xl font-bold">{profile?.total_emissions.toFixed(2)}</div>
                <p className="text-sm text-muted-foreground">kg CO₂</p>
              </div>

              <div className="text-center p-6 rounded-lg bg-gradient-to-br from-accent/10 to-primary/10">
                <Award className="w-8 h-8 mx-auto mb-2 text-accent" />
                <div className="text-3xl font-bold">{profile?.coins}</div>
                <p className="text-sm text-muted-foreground">Eco Coins</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Emissions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Recent Emissions</CardTitle>
            <CardDescription>Your latest tracked activities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {emissions.map((emission) => (
                <div
                  key={emission.id}
                  className="flex items-center justify-between p-4 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Badge className={`${getCategoryColor(emission.category)} text-white`}>
                      {emission.category}
                    </Badge>
                    <div>
                      <p className="font-medium">{emission.amount.toFixed(2)} kg CO₂</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(emission.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteEmission(emission.id)}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              ))}

              {emissions.length === 0 && (
                <div className="text-center py-12 text-muted-foreground">
                  <TrendingDown className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No emissions tracked yet.</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => navigate("/calculator")}
                  >
                    Start Tracking
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;
