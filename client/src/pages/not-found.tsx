import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import { HexagonPattern } from "@/components/ui/hexagon-pattern";
import { HyfeLogo } from "@/components/ui/hyfe-logo";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <HexagonPattern className="min-h-screen w-full flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mx-auto mb-8">
        <HyfeLogo size="large" />
      </div>
      
      <Card className="w-full max-w-md mx-auto border-none shadow-lg">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6 text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mb-2" />
            <h1 className="text-2xl font-bold text-secondary">404 Page Not Found</h1>
            <p className="mt-4 text-secondary-medium">
              The page you're looking for doesn't exist or has been moved.
            </p>
          </div>

          <div className="flex justify-center mt-6">
            <Link href="/">
              <Button className="bg-primary text-secondary-dark hover:bg-primary-hover">
                Go to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </HexagonPattern>
  );
}
