import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { siteConfig } from "@/config/site";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const features = [
  {
    title: "Complete Authentication",
    description: "Local auth, social logins (Google, Apple), email verification, and secure session management.",
    icon: "🔐"
  },
  {
    title: "Stripe Payment Integration",
    description: "Subscriptions, one-time payments, webhooks, invoice management with Stripe's latest APIs.",
    icon: "💳"
  },
  {
    title: "Multi-Provider Email Service",
    description: "AWS SES, SendGrid, SMTP support with beautiful email templates and delivery tracking.",
    icon: "📧"
  },
  {
    title: "AWS S3 File Storage",
    description: "Image uploads, profile avatars, secure file management with direct browser uploads.",
    icon: "☁️"
  },
  {
    title: "Modern UI with shadcn/ui",
    description: "Beautiful, responsive design with dark/light mode and accessible components.",
    icon: "🎨"
  },
  {
    title: "Production-Grade Security",
    description: "Rate limiting, CORS, input validation, session management, and security best practices.",
    icon: "🛡️"
  }
];

const techStack = {
  frontend: [
    "React 19", "TypeScript", "Vite", "Tailwind CSS", "shadcn/ui", "React Router"
  ],
  backend: [
    "Express.js", "MongoDB", "Passport.js", "Winston", "Jest", "TypeScript"
  ],
  integrations: [
    "Stripe", "AWS S3", "AWS SES", "SendGrid", "Google OAuth", "Apple Sign In"
  ]
};

export default function Landing() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 flex h-16 items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-lg">V</span>
            </div>
            <span className="text-xl font-bold">{siteConfig.name}</span>
          </div>
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-muted-foreground">Welcome, {user?.firstName || user?.email}</span>
                <Button asChild>
                  <Link to="/dashboard">Go to Dashboard</Link>
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Button variant="ghost" asChild>
                  <Link to="/login">Login</Link>
                </Button>
                <Button asChild>
                  <Link to="/signup">Get Started</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4">
        <div className="mx-auto max-w-4xl text-center">
          <div className="mb-6">
            <Badge variant="secondary" className="mb-4">
              🚀 Full-Stack Template
            </Badge>
          </div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6">
            Build Amazing Apps
            <br />
            <span className="text-primary">Faster Than Ever</span>
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 max-w-3xl mx-auto leading-relaxed">
            {siteConfig.description}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!isAuthenticated ? (
              <>
                <Button size="lg" asChild className="text-lg px-8">
                  <Link to="/signup">Get Started Free</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </Button>
              </>
            ) : (
              <>
                <Button size="lg" asChild className="text-lg px-8">
                  <Link to="/dashboard">Open Dashboard</Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-lg px-8">
                  <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer">
                    View on GitHub
                  </a>
                </Button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything You Need</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Production-ready features that save you weeks of development time
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card key={index} className="border-2 hover:border-primary/50 transition-colors">
              <CardHeader>
                <div className="text-4xl mb-3">{feature.icon}</div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
                <CardDescription className="text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          ))}
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Modern Tech Stack</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Built with the latest and most reliable technologies
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <span className="text-2xl mr-3">⚛️</span>
                Frontend
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-4">
                {techStack.frontend.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <span className="text-2xl mr-3">🔧</span>
                Backend
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-4">
                {techStack.backend.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center text-xl">
                <span className="text-2xl mr-3">🔌</span>
                Integrations
              </CardTitle>
              <div className="flex flex-wrap gap-2 pt-4">
                {techStack.integrations.map((tech) => (
                  <Badge key={tech} variant="secondary">{tech}</Badge>
                ))}
              </div>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <Card className="border-2 border-primary/20 bg-primary/5">
          <CardHeader className="text-center py-16">
            <CardTitle className="text-3xl md:text-4xl mb-4">
              Ready to Build Something Amazing?
            </CardTitle>
            <CardDescription className="text-lg md:text-xl mb-8 max-w-2xl mx-auto">
              Join thousands of developers who chose VibeKit to accelerate their projects.
              Start building your next big idea today.
            </CardDescription>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" asChild className="text-lg px-8">
                    <Link to="/signup">Start Building Now</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8">
                    <Link to="/login">Already Have Account?</Link>
                  </Button>
                </>
              ) : (
                <>
                  <Button size="lg" asChild className="text-lg px-8">
                    <Link to="/dashboard">Continue Building</Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild className="text-lg px-8">
                    <Link to="/subscription/plans">View Plans</Link>
                  </Button>
                </>
              )}
            </div>
          </CardHeader>
        </Card>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 rounded bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">V</span>
            </div>
            <span className="font-bold">{siteConfig.name}</span>
          </div>
          <p className="text-muted-foreground mb-4">
            Built with ❤️ for developers who want to focus on building amazing products, not boilerplate.
          </p>
          <div className="flex justify-center space-x-6">
            <a href={siteConfig.links.github} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              GitHub
            </a>
            <a href={siteConfig.links.twitter} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
              Twitter
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}