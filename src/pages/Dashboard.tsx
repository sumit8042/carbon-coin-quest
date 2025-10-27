import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Leaf, TrendingDown, Award, Calculator, Trophy, User, LogOut } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

interface Profile {
  username: string;
  coins: number;
  total_emissions: number;
}

interface Emission {
  category: string;
  amount: number;
}

const Dashboard = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [emissions, setEmissions] = useState<Emission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkUser();
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    await loadProfile(session.user.id);
    await loadEmissions(session.user.id);
    setLoading(false);
  };

  const loadProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from("profiles")
      .select("username, coins, total_emissions")
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
      .select("category, amount")
      .eq("user_id", userId);

    if (error) {
      toast.error("Failed to load emissions");
      return;
    }

    // Aggregate by category
    const aggregated = data.reduce((acc: any[], curr) => {
      const existing = acc.find(item => item.category === curr.category);
      if (existing) {
        existing.amount += parseFloat(curr.amount.toString());
      } else {
        acc.push({ category: curr.category, amount: parseFloat(curr.amount.toString()) });
      }
      return acc;
    }, []);

    setEmissions(aggregated);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const COLORS = {
    travel: "hsl(var(--primary))",
    electricity: "hsl(var(--accent))",
    food: "hsl(var(--success))",
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
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 gradient-eco rounded-full flex items-center justify-center">
              <Leaf className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {profile?.username} 🌍</h1>
              <p className="text-muted-foreground">Track your carbon footprint journey</p>
            </div>
          </div>
          <Button variant="outline" onClick={handleLogout}>
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>

        {/* Navigation Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="shadow-soft hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate("/dashboard")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dashboard</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          
          <Card className="shadow-soft hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate("/calculator")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Calculator</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          
          <Card className="shadow-soft hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate("/leaderboard")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Leaderboard</CardTitle>
              <Trophy className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </Card>
          
          <Card className="shadow-soft hover:shadow-glow transition-all cursor-pointer" onClick={() => navigate("/profile")}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
          </Card>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emissions</CardTitle>
              <TrendingDown className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.total_emissions.toFixed(2)} kg</div>
              <p className="text-xs text-muted-foreground mt-1">CO₂ equivalent</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft gradient-eco text-white">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Eco Coins</CardTitle>
              <Award className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{profile?.coins}</div>
              <p className="text-xs mt-1 opacity-90">Keep logging to earn more!</p>
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categories</CardTitle>
              <Calculator className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{emissions.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Emission types tracked</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Emissions by Category</CardTitle>
              <CardDescription>Your carbon footprint breakdown</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {emissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emissions}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No emission data yet. Start tracking!
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-soft">
            <CardHeader>
              <CardTitle>Category Distribution</CardTitle>
              <CardDescription>Percentage of total emissions</CardDescription>
            </CardHeader>
            <CardContent className="h-[300px]">
              {emissions.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={emissions}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {emissions.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.category as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-muted-foreground">
                  No emission data yet. Start tracking!
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Get started with tracking your carbon footprint</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-4">
            <Button onClick={() => navigate("/calculator")} className="gradient-eco text-white">
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Emissions
            </Button>
            <Button variant="outline" onClick={() => navigate("/leaderboard")}>
              <Trophy className="w-4 h-4 mr-2" />
              View Leaderboard
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
