import * as React from "react";
import { Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background text-white flex items-center justify-center px-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center space-y-4">
          <h2 className="text-4xl font-bold">404</h2>
          <p className="text-xl text-white/60">Page not found</p>
        </CardHeader>
        <CardContent>
          <Link href="/" className="w-full">
            <Button className="w-full" size="lg" variant="glass">
              <Home className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
