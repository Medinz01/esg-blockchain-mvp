import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Navbar } from "@/components/Navbar";
import { Shield, Database, CheckCircle, Leaf } from "lucide-react";
import heroImage from "@/assets/hero-esg.jpg";

export default function Index() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden gradient-hero">
        <div className="absolute inset-0 z-0">
          <img src={heroImage} alt="ESG Blockchain" className="w-full h-full object-cover opacity-20" />
        </div>
        <div className="container relative z-10 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm">
              <Leaf className="h-4 w-4 text-primary" />
              <span className="font-medium">Blockchain-Verified Sustainability</span>
            </div>
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl animate-fade-in">
              Stop Greenwashing with{" "}
              <span className="text-primary">Transparent ESG Data</span>
            </h1>
            <p className="text-xl text-muted-foreground animate-fade-in">
              Track, verify, and prove your Environmental, Social, and Governance metrics with
              immutable blockchain technology. Build trust through transparency.
            </p>
            <div className="flex flex-wrap justify-center gap-4 animate-slide-up">
              <Link to="/register">
                <Button size="lg" className="text-base">
                  Get Started
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline" className="text-base">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Why Choose Blockchain for ESG?</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Our platform ensures your sustainability claims are permanently recorded, independently verified,
            and impossible to manipulate.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          <Card className="gradient-card border-2 transition-smooth hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Immutable Records</CardTitle>
              <CardDescription>
                Every ESG metric is permanently stored on the blockchain, creating an unchangeable audit trail
                that builds stakeholder confidence.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card border-2 transition-smooth hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-secondary/10">
                <CheckCircle className="h-6 w-6 text-secondary" />
              </div>
              <CardTitle>Third-Party Verification</CardTitle>
              <CardDescription>
                Independent auditors verify your data on-chain, ensuring credibility and compliance with
                global sustainability standards.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="gradient-card border-2 transition-smooth hover:shadow-lg">
            <CardHeader>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-success/10">
                <Database className="h-6 w-6 text-success" />
              </div>
              <CardTitle>Complete Transparency</CardTitle>
              <CardDescription>
                Stakeholders can access and verify your ESG performance in real-time, eliminating doubt
                and demonstrating authentic commitment.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t bg-muted/30">
        <div className="container py-24">
          <div className="mx-auto max-w-3xl text-center space-y-8">
            <h2 className="text-3xl font-bold">
              Ready to Prove Your Sustainability Commitment?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join forward-thinking companies using blockchain to demonstrate genuine ESG progress.
            </p>
            <Link to="/register">
              <Button size="lg" className="text-base">
                Start Recording ESG Data
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
