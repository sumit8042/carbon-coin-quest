import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Car, Zap, Utensils, ArrowLeft } from "lucide-react";

const Calculator = () => {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Travel state
  const [travelDistance, setTravelDistance] = useState("");
  const [transportMode, setTransportMode] = useState("");

  // Electricity state
  const [electricityKwh, setElectricityKwh] = useState("");
  const [energySource, setEnergySource] = useState("");

  // Food state
  const [dietType, setDietType] = useState("");
  const [foodQuantity, setFoodQuantity] = useState("");

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
  };

  const calculateTravelEmissions = (distance: number, mode: string): number => {
    const emissionFactors: { [key: string]: number } = {
      "car-petrol": 0.21,
      "car-diesel": 0.17,
      "car-electric": 0.05,
      "bike-petrol": 0.10,
      "bike-electric": 0.03,
      "bus": 0.10,
      "train": 0.04,
      "metro": 0.03,
      "airplane-domestic": 0.25,
      "airplane-international": 0.18,
    };
    return distance * (emissionFactors[mode] || 0);
  };

  const calculateElectricityEmissions = (kwh: number, source: string): number => {
    const emissionFactors: { [key: string]: number } = {
      "renewable": 0.02,
      "non-renewable": 0.5,
    };
    return kwh * (emissionFactors[source] || 0);
  };

  const calculateFoodEmissions = (diet: string, quantity: number): number => {
    const emissionFactors: { [key: string]: number } = {
      "non-vegetarian": 7.2,
      "vegetarian": 3.8,
      "vegan": 2.9,
    };
    return (emissionFactors[diet] || 0) * quantity;
  };

  const handleTravelSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    const distance = parseFloat(travelDistance);
    const emissions = calculateTravelEmissions(distance, transportMode);

    const { error } = await supabase.from("emissions").insert({
      user_id: userId,
      category: "travel",
      amount: emissions,
      transport_mode: transportMode,
      details: { distance },
    });

    if (error) {
      toast.error("Failed to save emissions");
    } else {
      toast.success(`Added ${emissions.toFixed(2)} kg CO₂ from travel! +10 coins 🪙`);
      // Award coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("user_id", userId)
        .single();
      
      if (profile) {
        await supabase
          .from("profiles")
          .update({ coins: profile.coins + 10 })
          .eq("user_id", userId);
      }
      
      setTravelDistance("");
      setTransportMode("");
    }
    setLoading(false);
  };

  const handleElectricitySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    const kwh = parseFloat(electricityKwh);
    const emissions = calculateElectricityEmissions(kwh, energySource);

    const { error } = await supabase.from("emissions").insert({
      user_id: userId,
      category: "electricity",
      amount: emissions,
      energy_source: energySource,
      details: { kwh },
    });

    if (error) {
      toast.error("Failed to save emissions");
    } else {
      toast.success(`Added ${emissions.toFixed(2)} kg CO₂ from electricity! +10 coins 🪙`);
      // Award coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("user_id", userId)
        .single();
      
      if (profile) {
        await supabase
          .from("profiles")
          .update({ coins: profile.coins + 10 })
          .eq("user_id", userId);
      }
      
      setElectricityKwh("");
      setEnergySource("");
    }
    setLoading(false);
  };

  const handleFoodSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;

    setLoading(true);
    const quantity = parseFloat(foodQuantity);
    const emissions = calculateFoodEmissions(dietType, quantity);

    const { error } = await supabase.from("emissions").insert({
      user_id: userId,
      category: "food",
      amount: emissions,
      diet_type: dietType,
      details: { diet: dietType, quantity },
    });

    if (error) {
      toast.error("Failed to save emissions");
    } else {
      toast.success(`Added ${emissions.toFixed(2)} kg CO₂ from food! +10 coins 🪙`);
      // Award coins
      const { data: profile } = await supabase
        .from("profiles")
        .select("coins")
        .eq("user_id", userId)
        .single();
      
      if (profile) {
        await supabase
          .from("profiles")
          .update({ coins: profile.coins + 10 })
          .eq("user_id", userId);
      }
      
      setDietType("");
      setFoodQuantity("");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen gradient-earth p-4 md:p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>

        <Card className="shadow-soft">
          <CardHeader>
            <CardTitle className="text-3xl">Carbon Calculator</CardTitle>
            <CardDescription>Calculate your daily emissions and earn eco-coins</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="travel" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="travel">
                  <Car className="w-4 h-4 mr-2" />
                  Travel
                </TabsTrigger>
                <TabsTrigger value="electricity">
                  <Zap className="w-4 h-4 mr-2" />
                  Electricity
                </TabsTrigger>
                <TabsTrigger value="food">
                  <Utensils className="w-4 h-4 mr-2" />
                  Food
                </TabsTrigger>
              </TabsList>

              <TabsContent value="travel" className="space-y-4 mt-6">
                <form onSubmit={handleTravelSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      placeholder="10"
                      value={travelDistance}
                      onChange={(e) => setTravelDistance(e.target.value)}
                      required
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="transport">Transport Mode</Label>
                    <Select value={transportMode} onValueChange={setTransportMode} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select transport mode" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car-petrol">Car (Petrol)</SelectItem>
                        <SelectItem value="car-diesel">Car (Diesel)</SelectItem>
                        <SelectItem value="car-electric">Electric Car</SelectItem>
                        <SelectItem value="bike-petrol">Bike (Petrol)</SelectItem>
                        <SelectItem value="bike-electric">Electric Bike</SelectItem>
                        <SelectItem value="bus">Bus</SelectItem>
                        <SelectItem value="train">Train</SelectItem>
                        <SelectItem value="metro">Metro</SelectItem>
                        <SelectItem value="airplane-domestic">Airplane (Domestic)</SelectItem>
                        <SelectItem value="airplane-international">Airplane (International)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate Travel Emissions"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="electricity" className="space-y-4 mt-6">
                <form onSubmit={handleElectricitySubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="kwh">Electricity (kWh)</Label>
                    <Input
                      id="kwh"
                      type="number"
                      placeholder="100"
                      value={electricityKwh}
                      onChange={(e) => setElectricityKwh(e.target.value)}
                      required
                      min="0.1"
                      step="0.1"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="energy-source">Energy Source</Label>
                    <Select value={energySource} onValueChange={setEnergySource} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select energy source" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="renewable">Renewable</SelectItem>
                        <SelectItem value="non-renewable">Non-Renewable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate Electricity Emissions"}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="food" className="space-y-4 mt-6">
                <form onSubmit={handleFoodSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="diet">Diet Type</Label>
                    <Select value={dietType} onValueChange={setDietType} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select diet type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="quantity">Number of Meals</Label>
                    <Input
                      id="quantity"
                      type="number"
                      placeholder="3"
                      value={foodQuantity}
                      onChange={(e) => setFoodQuantity(e.target.value)}
                      required
                      min="0.1"
                      step="0.1"
                    />
                    <p className="text-sm text-muted-foreground">
                      Daily emissions will be calculated per meal based on diet type
                    </p>
                  </div>

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Calculating..." : "Calculate Food Emissions"}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        <Card className="shadow-soft gradient-eco text-white">
          <CardHeader>
            <CardTitle>💡 Eco Tips</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p>• Try cycling or walking for short distances</p>
            <p>• Switch to renewable energy sources</p>
            <p>• Reduce meat consumption to lower food emissions</p>
            <p>• Use public transport when possible</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Calculator;
